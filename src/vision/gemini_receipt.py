"""Receipt extraction via Gemini Vision."""

from __future__ import annotations

import uuid
from datetime import date
from typing import Any

from src.core.tool_result import ToolResult
from src.llm.gemini_client import analyze_receipt_image
from src.models.expense import Receipt, ReceiptItem


def extract_receipt_with_gemini(image_bytes: bytes) -> ToolResult:
    if not image_bytes:
        return ToolResult.error(
            summary="Empty image for Gemini Vision",
            error_hint="Received empty bytes. Check upload handling.",
            next_actions=["Ask user to re-upload the receipt image"],
        )

    result = analyze_receipt_image(image_bytes, _detect_mime_type(image_bytes))
    if result.failed:
        return result

    try:
        receipt, draft_items = _normalize_receipt_payload(result.data if isinstance(result.data, dict) else {})
    except Exception as exc:
        return ToolResult.error(
            summary="Gemini Vision receipt normalization failed",
            error_hint=f"{type(exc).__name__}: {exc}",
            next_actions=["Retry with a clearer receipt image", "Inspect Gemini JSON response"],
        )

    return ToolResult.success(
        summary=f"Gemini Vision extracted {len(draft_items)} receipt items",
        data={"receipt": receipt, "fields": [], "draft_items": draft_items},
        next_actions=["Classify receipt items", "Generate insight"],
        artifacts={"receipt_id": str(receipt.id)},
    )


def _normalize_receipt_payload(payload: dict[str, Any]) -> tuple[Receipt, list[dict[str, Any]]]:
    merchant = str(payload.get("merchant") or "Unknown Merchant").strip() or "Unknown Merchant"
    purchase_date = _parse_date(payload.get("purchase_date"))
    currency = str(payload.get("currency") or "VND").strip() or "VND"
    raw_text = str(payload.get("raw_text") or "").strip()
    rows = payload.get("items") if isinstance(payload.get("items"), list) else []

    receipt_items: list[ReceiptItem] = []
    draft_items: list[dict[str, Any]] = []
    for row in rows:
        if not isinstance(row, dict):
            continue
        name = str(row.get("name") or "").strip()
        if not name:
            continue
        quantity = _positive_float(row.get("quantity"), default=1.0)
        unit_price = _money(row.get("unit_price"))
        discount = _money(row.get("discount"))
        total_price = _money(row.get("total_price"))
        if total_price <= 0 and unit_price > 0:
            total_price = max(0.0, quantity * unit_price - discount)
        if unit_price <= 0 and quantity > 0:
            unit_price = total_price / quantity

        item = ReceiptItem(
            name=name,
            quantity=quantity,
            unit_price=unit_price,
            discount=discount,
            total_price=total_price,
            category="khac",
        )
        receipt_items.append(item)
        draft_items.append(_draft_item(item))

    total_amount = _money(payload.get("total_amount"))
    if total_amount <= 0:
        total_amount = sum(item.total_price for item in receipt_items)

    if not receipt_items and total_amount > 0:
        item = ReceiptItem(
            name="Receipt total",
            quantity=1.0,
            unit_price=total_amount,
            discount=0.0,
            total_price=total_amount,
            category="khac",
        )
        receipt_items.append(item)
        draft_items.append(_draft_item(item))

    if not receipt_items:
        raise ValueError("Gemini did not return any receipt items or total amount")

    if not raw_text:
        raw_lines = [merchant, *[f"{item.name} {item.total_price:.0f}" for item in receipt_items], f"Total {total_amount:.0f}"]
        raw_text = "\n".join(raw_lines)

    receipt = Receipt(
        merchant=merchant,
        purchase_date=purchase_date,
        items=receipt_items,
        total_amount=total_amount,
        currency=currency,
        raw_text=raw_text,
    )
    return receipt, draft_items


def _draft_item(item: ReceiptItem) -> dict[str, Any]:
    return {
        "id": str(uuid.uuid4()),
        "name": item.name,
        "quantity": item.quantity,
        "unit_price": item.unit_price,
        "discount": item.discount,
        "total_price": item.total_price,
        "category": item.category,
        "source_token_ids": {"name": None, "quantity": None, "unit_price": None, "discount": None},
    }


def _parse_date(value: Any) -> date:
    if isinstance(value, date):
        return value
    text = str(value or "").strip()
    if not text:
        return date.today()
    try:
        return date.fromisoformat(text[:10])
    except ValueError:
        return date.today()


def _money(value: Any) -> float:
    try:
        return max(0.0, float(str(value or "0").replace(",", "").strip()))
    except ValueError:
        return 0.0


def _positive_float(value: Any, *, default: float) -> float:
    try:
        parsed = float(str(value or "").replace(",", "").strip())
    except ValueError:
        return default
    return parsed if parsed > 0 else default


def _detect_mime_type(image_bytes: bytes) -> str:
    if image_bytes.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if image_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if image_bytes[:4] == b"RIFF" and image_bytes[8:12] == b"WEBP":
        return "image/webp"
    return "image/jpeg"
