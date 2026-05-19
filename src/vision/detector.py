"""
Receipt region detector — YOLOv11 stub.

Replace _run_model() body with real Ultralytics inference when model is ready.
The ToolResult contract must not change.
"""

from __future__ import annotations

import uuid
from functools import lru_cache
from io import BytesIO
from pathlib import Path

from src.core.config import get_settings
from src.core.tool_result import ToolResult


def detect_receipt(image_bytes: bytes) -> ToolResult:
    """
    Detect and crop the receipt region from a raw image.

    Args:
        image_bytes: raw image content (JPEG / PNG)

    Returns:
        ToolResult.data = {"cropped_bytes": bytes, "confidence": float}
    """
    if not image_bytes:
        return ToolResult.error(
            summary="Empty image provided",
            error_hint="image_bytes is empty. Ensure the upload is not corrupted.",
            next_actions=["Ask user to re-upload the receipt image"],
        )

    try:
        detections = _run_model(image_bytes)
    except NotImplementedError:
        # Stub passthrough: treat full image as available for manual review.
        return ToolResult.success(
            summary="Detection skipped — model not loaded, using full image",
            data={"cropped_bytes": image_bytes, "image_bytes": image_bytes, "detections": [], "confidence": 1.0},
            next_actions=["Extract text from detected fields or region"],
        )
    except Exception as exc:
        return ToolResult.error(
            summary="YOLOv11 inference failed",
            error_hint=(
                f"{type(exc).__name__}: {exc}. Check YOLO_MODEL_PATH or "
                "YOLO_MODEL_REPO/YOLO_MODEL_FILENAME."
            ),
            next_actions=["Verify model file exists", "Verify Hugging Face repo/file/token", "Retry analysis"],
        )

    return ToolResult.success(
        summary=f"Detected {len(detections)} receipt fields",
        data={"cropped_bytes": image_bytes, "image_bytes": image_bytes, "detections": detections, "confidence": 0.95},
        next_actions=["Run OCR on detected fields"],
    )


def _run_model(image_bytes: bytes) -> list[dict]:
    cfg = get_settings()
    model_path = _resolve_model_path(
        cfg.yolo_model_path,
        cfg.yolo_model_repo,
        cfg.yolo_model_filename,
        cfg.yolo_model_revision,
        cfg.hf_token,
    )
    if not model_path:
        raise NotImplementedError

    try:
        from PIL import Image
    except Exception as exc:
        raise RuntimeError("Pillow is required to decode receipt images") from exc

    model = _load_yolo(model_path)
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    result = model.predict(image, conf=cfg.yolo_confidence, verbose=False)[0]
    names = result.names
    detections: list[dict] = []

    for box in result.boxes:
        x1, y1, x2, y2 = [float(v) for v in box.xyxy[0].tolist()]
        width = x2 - x1
        height = y2 - y1
        class_id = int(box.cls[0].item())
        detections.append(
            {
                "id": str(uuid.uuid4()),
                "x": x1 + width / 2,
                "y": y1 + height / 2,
                "width": width,
                "height": height,
                "confidence": float(box.conf[0].item()),
                "class_name": str(names.get(class_id, class_id)),
                "class_id": class_id,
            }
        )
    return detections


def _resolve_model_path(
    local_path: str,
    repo_id: str,
    filename: str,
    revision: str,
    token: str,
) -> str:
    if local_path and Path(local_path).exists():
        return local_path

    if not repo_id or not filename:
        raise NotImplementedError

    try:
        from huggingface_hub import hf_hub_download
    except Exception as exc:
        raise RuntimeError("huggingface-hub is required to download YOLO weights") from exc

    return hf_hub_download(
        repo_id=repo_id,
        filename=filename,
        revision=revision or "main",
        token=token or None,
    )


@lru_cache
def _load_yolo(model_path: str):
    try:
        from ultralytics import YOLO
    except Exception as exc:
        raise RuntimeError("ultralytics is required to load YOLOv11 weights") from exc
    return YOLO(model_path)
