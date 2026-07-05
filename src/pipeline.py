"""
Pipeline orchestrator — chains all tools in order.

Flow:
  detect → ocr → embed → cache_lookup
                              ├── HIT  → return cached insight
                              └── MISS → generate → cache_store → return insight

Each step returns ToolResult. The orchestrator stops on status=error and
propagates error_hint so the API layer can surface a meaningful message.
"""

from __future__ import annotations

import structlog

from src.cache.vector_store import cache_lookup, cache_store
from src.core.config import get_settings
from src.core.tool_result import ToolResult, ToolStatus
from src.embedding.embedder import embed_text
from src.llm.gemini_client import classify_receipt_items, generate_insight
from src.models.expense import Insight, Receipt
from src.vision.gemini_receipt import extract_receipt_with_gemini

log = structlog.get_logger()


class PipelineError(Exception):
    def __init__(self, step: str, result: ToolResult) -> None:
        self.step = step
        self.result = result
        super().__init__(f"[{step}] {result.summary}")


def analyze_receipt(image_bytes: bytes) -> Insight:
    return analyze_receipt_details(image_bytes)["insight"]


def analyze_receipt_details(image_bytes: bytes) -> dict:
    """
    Full pipeline: image bytes → receipt draft + fields + Insight.

    Raises:
        PipelineError if any step returns status=error.
    """
    cfg = get_settings()
    analyzer = cfg.receipt_analyzer.strip().lower()
    if analyzer in {"gemini", "gemini_vision"}:
        return _analyze_with_gemini_vision(image_bytes)
    if analyzer in {"yolo_vietocr", "yolo", "legacy"}:
        return _analyze_with_yolo_vietocr(image_bytes)

    raise PipelineError(
        "config",
        ToolResult.error(
            summary="Unsupported receipt analyzer",
            error_hint=f"RECEIPT_ANALYZER={cfg.receipt_analyzer!r} is not supported. Use gemini_vision or yolo_vietocr.",
            next_actions=["Set RECEIPT_ANALYZER=gemini_vision", "Restart FastAPI"],
        ),
    )


def _analyze_with_gemini_vision(image_bytes: bytes) -> dict:
    log.info("pipeline.gemini_vision.start")
    receipt_result = extract_receipt_with_gemini(image_bytes)
    _require_ok(receipt_result, "gemini_vision")
    receipt, fields, draft_items = _receipt_payload(receipt_result)
    log.info("pipeline.gemini_vision.done", merchant=receipt.merchant, items=len(receipt.items), draft_items=len(draft_items))
    return _complete_receipt_analysis(receipt, fields, draft_items)


def _analyze_with_yolo_vietocr(image_bytes: bytes) -> dict:
    from src.vision.detector import detect_receipt
    from src.vision.ocr import extract_receipt

    # 1. Detect receipt region
    log.info("pipeline.detect.start")
    detect_result = detect_receipt(image_bytes)
    _require_ok(detect_result, "detect")

    cropped: bytes = detect_result.data["cropped_bytes"]
    raw_detections: list[dict] = detect_result.data.get("detections", [])
    detections: list[dict] = [
        detection
        for detection in raw_detections
        if str(detection.get("class_name", "")).strip().lower().replace("-", "_").replace(" ", "_") != "store_name"
    ]
    log.info(
        "pipeline.detect.done",
        raw_detections=len(raw_detections),
        usable_detections=len(detections),
        classes=_class_counts(raw_detections),
    )
    if not detections:
        raise PipelineError(
            "detect",
            ToolResult.error(
                summary="YOLOv11 found no usable Item/price/quantity boxes",
                error_hint="The model only detected store_name boxes or no boxes. Use a clearer receipt image or lower YOLO_CONFIDENCE.",
                next_actions=["Retake a sharper receipt photo", "Set YOLO_CONFIDENCE=0.1", "Retry analysis"],
            ),
        )

    # 2. OCR extraction
    log.info("pipeline.ocr.start")
    ocr_result = extract_receipt(cropped, detections)
    _require_ok(ocr_result, "ocr")

    receipt, fields, draft_items = _receipt_payload(ocr_result)
    log.info("pipeline.ocr.done", merchant=receipt.merchant, items=len(receipt.items), draft_items=len(draft_items), fields=len(fields))
    return _complete_receipt_analysis(receipt, fields, draft_items)


def _receipt_payload(result: ToolResult) -> tuple[Receipt, list[dict], list[dict]]:
    payload = result.data
    if isinstance(payload, dict):
        receipt: Receipt = payload["receipt"]
        fields: list[dict] = payload.get("fields", [])
        draft_items: list[dict] = payload.get("draft_items", [])
        return receipt, fields, draft_items

    receipt = payload
    fields = []
    draft_items = [
        {
            "id": str(item.name),
            "name": item.name,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "total_price": item.total_price,
            "category": item.category,
            "source_token_ids": {},
        }
        for item in receipt.items
    ]
    return receipt, fields, draft_items


def _complete_receipt_analysis(receipt: Receipt, fields: list[dict], draft_items: list[dict]) -> dict:
    # Classify every detected item name in a single Gemma request. This is
    # non-fatal because users can still correct categories in the review UI.
    log.info("pipeline.classify_items.start", items=len(draft_items))
    classify_result = classify_receipt_items(draft_items)
    if classify_result.status == ToolStatus.ERROR:
        log.warning("pipeline.classify_items.error", hint=classify_result.error_hint)
    elif classify_result.status == ToolStatus.WARNING:
        log.warning("pipeline.classify_items.warning", hint=classify_result.error_hint)
    _apply_item_categories(receipt, draft_items, classify_result.data if isinstance(classify_result.data, dict) else {})

    cfg = get_settings()
    if not cfg.semantic_cache_enabled:
        log.info("pipeline.cache.skipped")
        insight = _generate_and_store(receipt, None, skip_store=True)
        return _details_payload(receipt, insight, fields, draft_items)

    # Embed canonical text only when semantic cache is enabled.
    log.info("pipeline.embed.start")
    embed_result = embed_text(receipt.canonical_text)
    _require_ok(embed_result, "embed")

    vector: list[float] = embed_result.data

    # Cache lookup
    log.info("pipeline.cache.lookup")
    lookup_result = cache_lookup(vector, str(receipt.id))

    if lookup_result.status == ToolStatus.ERROR:
        # Cache unreachable — degrade gracefully, call LLM directly
        log.warning("pipeline.cache.unreachable", hint=lookup_result.error_hint)
        insight = _generate_and_store(receipt, vector, skip_store=True)
        return _details_payload(receipt, insight, fields, draft_items)

    if lookup_result.ok:
        log.info("pipeline.cache.hit", similarity=lookup_result.data.similarity_score)
        return _details_payload(receipt, lookup_result.data, fields, draft_items)

    # Cache miss → generate insight
    log.info("pipeline.cache.miss")
    insight = _generate_and_store(receipt, vector)
    return _details_payload(receipt, insight, fields, draft_items)


def _details_payload(receipt: Receipt, insight: Insight, fields: list[dict], draft_items: list[dict]) -> dict:
    return {
        "receipt": receipt,
        "insight": insight,
        "fields": fields,
        "draft_items": draft_items,
    }


def _apply_item_categories(receipt: Receipt, draft_items: list[dict], categories: dict[str, str]) -> None:
    draft_category_by_name: dict[str, str] = {}
    for draft_item in draft_items:
        category = categories.get(str(draft_item.get("id", ""))) or str(draft_item.get("category", "khac") or "khac")
        draft_item["category"] = category
        name = str(draft_item.get("name", "")).strip()
        if name:
            draft_category_by_name[name] = category

    for item in receipt.items:
        item.category = draft_category_by_name.get(item.name, item.category or "khac")


def _class_counts(detections: list[dict]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for detection in detections:
        class_name = str(detection.get("class_name", "unknown"))
        counts[class_name] = counts.get(class_name, 0) + 1
    return counts


def _generate_and_store(receipt: Receipt, vector: list[float] | None, *, skip_store: bool = False) -> Insight:
    gen_result = generate_insight(receipt)
    _require_ok(gen_result, "generate")

    insight: Insight = gen_result.data

    if not skip_store and vector is not None:
        store_result = cache_store(vector, insight)
        if store_result.failed:
            # Non-fatal: log and continue — user still gets the insight
            log.warning("pipeline.cache.store_failed", hint=store_result.error_hint)
        else:
            log.info("pipeline.cache.stored", vector_id=store_result.artifacts.get("vector_id"))

    return insight


def _require_ok(result: ToolResult, step: str) -> None:
    """Raise PipelineError if the tool returned status=error."""
    if result.status == ToolStatus.ERROR:
        log.error("pipeline.step_failed", step=step, hint=result.error_hint)
        raise PipelineError(step, result)
