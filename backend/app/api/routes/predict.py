from fastapi import APIRouter, File, HTTPException, UploadFile, Query
from app.core.settings import MAX_UPLOAD_BYTES
from app.inference.engine import engine, ModelUnavailable
from app.services.images import decode_image
from app.schemas.prediction import PredictionResponse, StatusResponse

router = APIRouter(prefix="/api/v1", tags=["ricepest"])
DISCLAIMER = ("Preliminary visual screening only. Counts estimate visible detections at the selected thresholds, "
              "not the total field population. Seek expert identification before pest-control decisions.")

@router.get("/health", response_model=StatusResponse)
def health():
    return StatusResponse(status="ok", model_ready=engine.model is not None,
        model_name=engine.model_name, class_count=len(engine.class_names),
        detail="Loaded" if engine.model is not None else "Model not loaded; check /ready")

@router.get("/ready", response_model=StatusResponse)
def ready():
    try:
        engine.load()
    except ModelUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return StatusResponse(status="ready", model_ready=True, model_name=engine.model_name,
                          class_count=len(engine.class_names), detail="Checkpoint and class mapping validated")

@router.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...),
    conf: float = Query(0.25, ge=0.05, le=0.95),
    iou: float = Query(0.65, ge=0.1, le=0.95),
    imgsz: int = Query(640, ge=320, le=1280, multiple_of=32)):
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=415, detail="Upload JPEG, PNG, or WebP")
    raw = await file.read(MAX_UPLOAD_BYTES + 1)
    image = decode_image(raw)
    try:
        detections, counts, ms = engine.predict(image, conf, iou, imgsz)
    except ModelUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Inference failed; inspect server logs") from exc
    return PredictionResponse(detections=detections, counts=counts,
        total_count=len(detections), image_width=image.width, image_height=image.height,
        confidence_threshold=conf, iou_threshold=iou, inference_ms=round(ms, 2),
        model_name=engine.model_name, disclaimer=DISCLAIMER)
