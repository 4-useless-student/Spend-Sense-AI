"""
OCR extractor — PaddleOCR stub.

Replace _run_ocr() body with real PaddleOCR call when ready.
"""

from __future__ import annotations

from datetime import date
from functools import lru_cache
from io import BytesIO
from typing import Any

from src.core.tool_result import ToolResult
from src.models.expense import Receipt, ReceiptItem
from src.vision.reconstructor import reconstruct_receipt


def extract_receipt(image_bytes: bytes, detections: list[dict[str, Any]] | None = None) -> ToolResult:
    """
    Run OCR on a (cropped) receipt image and parse structured data.

    Args:
        image_bytes: cropped receipt region bytes

    Returns:
        ToolResult.data = Receipt
    """
    if not image_bytes:
        return ToolResult.error(
            summary="Empty image for OCR",
            error_hint="Received empty bytes. Check detector output.",
            next_actions=["Re-run detection", "Ask user to re-upload"],
        )

    if detections:
        fields = _ocr_detected_fields(image_bytes, detections)
        receipt, draft_items = reconstruct_receipt(fields)
        result = ToolResult.warning(
            summary=f"OCR produced {len(fields)} detected fields",
            data=receipt,
            next_actions=["Embed receipt text", "Let user review reconstructed fields"],
            error_hint="VietOCR may be unavailable; empty fields can be corrected in the frontend.",
        )
        return result.model_copy(
            update={
                "artifacts": {"receipt_id": str(receipt.id)},
                "data": {"receipt": receipt, "fields": fields, "draft_items": draft_items},
            }
        )

    try:
        raw_text, items, merchant, purchase_date, total = _run_ocr(image_bytes)
    except NotImplementedError:
        # Stub: return a placeholder receipt so the pipeline can continue
        receipt = _stub_receipt()
        return ToolResult.warning(
            summary="OCR not implemented — returning stub receipt",
            data=receipt,
            next_actions=["Embed receipt text", "Replace stub with real OCR output"],
            error_hint="PaddleOCR not loaded. Set up PaddleOCR to enable real extraction.",
        )
    except Exception as exc:
        return ToolResult.error(
            summary="OCR extraction failed",
            error_hint=f"{type(exc).__name__}: {exc}",
            next_actions=["Check image quality", "Retry with enhanced contrast"],
        )

    receipt = Receipt(
        merchant=merchant,
        purchase_date=purchase_date,
        items=items,
        total_amount=total,
        raw_text=raw_text,
    )
    return ToolResult.success(
        summary=f"Extracted {len(items)} items from {merchant}",
        data=receipt,
        next_actions=["Embed receipt canonical text"],
        artifacts={"receipt_id": str(receipt.id)},
    )


def _run_ocr(image_bytes: bytes) -> tuple[str, list[ReceiptItem], str, date, float]:
    """Plug real PaddleOCR inference here."""
    raise NotImplementedError


def _ocr_detected_fields(image_bytes: bytes, detections: list[dict[str, Any]]) -> list[dict[str, Any]]:
    fields: list[dict[str, Any]] = []
    for detection in detections:
        class_name = str(detection.get("class_name", "field"))
        if _is_store_name(class_name):
            continue
        text = _read_box_text(image_bytes, detection)
        fields.append(
            {
                "id": str(detection.get("id") or detection.get("detection_id") or ""),
                "class_name": class_name,
                "text": text,
                "confidence": float(detection.get("confidence", 0)),
                "x": float(detection.get("x", 0)),
                "y": float(detection.get("y", 0)),
                "width": float(detection.get("width", 0)),
                "height": float(detection.get("height", 0)),
            }
        )
    return fields


def _is_store_name(class_name: str) -> bool:
    normalized = class_name.strip().lower().replace("-", "_").replace(" ", "_")
    return normalized == "store_name"


def _read_box_text(image_bytes: bytes, detection: dict[str, Any]) -> str:
    try:
        predictor = _vietocr_predictor()
        image = _crop_detection(image_bytes, detection)
        return str(predictor.predict(image)).strip()
    except Exception:
        return _fallback_text(str(detection.get("class_name", "")))


def _crop_detection(image_bytes: bytes, detection: dict[str, Any]):
    from PIL import Image

    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    padding = 4
    x = float(detection.get("x", 0))
    y = float(detection.get("y", 0))
    width = float(detection.get("width", 0))
    height = float(detection.get("height", 0))
    left = max(0, int(x - width / 2 - padding))
    top = max(0, int(y - height / 2 - padding))
    right = min(image.width, int(x + width / 2 + padding))
    bottom = min(image.height, int(y + height / 2 + padding))
    return image.crop((left, top, right, bottom))


@lru_cache
def _vietocr_predictor():
    from vietocr.tool.config import Cfg
    from vietocr.tool.predictor import Predictor

    config = Cfg.load_config_from_name("vgg_transformer")
    config["device"] = "cpu"
    return Predictor(config)


def _fallback_text(class_name: str) -> str:
    normalized = class_name.lower()
    if _is_store_name(normalized):
        return "Unknown Merchant"
    if normalized == "quantity":
        return "1"
    if normalized == "price":
        return "0"
    if normalized == "item":
        return "Unnamed item"
    return ""


def _stub_receipt() -> Receipt:
    return Receipt(
        merchant="Unknown Merchant",
        purchase_date=date.today(),
        items=[ReceiptItem(name="Item A", unit_price=10000, total_price=10000)],
        total_amount=10000,
        raw_text="[stub]",
    )
