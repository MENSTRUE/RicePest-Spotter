from io import BytesIO
from PIL import Image, ImageOps, UnidentifiedImageError
from fastapi import HTTPException
from app.core.settings import MAX_UPLOAD_BYTES, MAX_PIXELS

ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}

def decode_image(raw: bytes) -> Image.Image:
    if not raw:
        raise HTTPException(status_code=400, detail="Image file is empty")
    if len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds upload limit")
    try:
        with Image.open(BytesIO(raw)) as im:
            if im.format not in ALLOWED_FORMATS:
                raise HTTPException(status_code=415, detail="Unsupported image encoding")
            w, h = im.size
            if w <= 0 or h <= 0 or w * h > MAX_PIXELS:
                raise HTTPException(status_code=413, detail="Image dimensions exceed limit")
            im.load()
            return ImageOps.exif_transpose(im).convert("RGB")
    except HTTPException:
        raise
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError) as exc:
        raise HTTPException(status_code=422, detail="Cannot decode image") from exc
