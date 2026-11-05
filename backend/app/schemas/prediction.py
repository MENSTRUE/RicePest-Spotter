from pydantic import BaseModel, Field

class StatusResponse(BaseModel):
    status: str
    model_ready: bool
    model_name: str
    class_count: int
    detail: str

class Detection(BaseModel):
    model_class_id: int
    source_category_id: int | None
    class_name: str
    source_name: str | None
    confidence: float = Field(ge=0, le=1)
    bbox_xyxy: list[float] = Field(min_length=4, max_length=4)

class ClassCount(BaseModel):
    model_class_id: int
    source_category_id: int | None
    class_name: str
    count: int

class PredictionResponse(BaseModel):
    detections: list[Detection]
    counts: list[ClassCount]
    total_count: int
    image_width: int
    image_height: int
    confidence_threshold: float
    iou_threshold: float
    inference_ms: float
    model_name: str
    disclaimer: str
    model_status: str = "research_validation_only"
