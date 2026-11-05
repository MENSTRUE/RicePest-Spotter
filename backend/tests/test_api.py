from io import BytesIO
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app
from app.inference.engine import engine

client = TestClient(app)

def png():
    b = BytesIO()
    Image.new("RGB", (64, 48), "green").save(b, format="PNG")
    return b.getvalue()

def test_health_schema():
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    assert isinstance(r.json()["model_ready"], bool)

def test_bad_mime():
    r = client.post("/api/v1/predict", files={"file": ("bad.txt", b"bad", "text/plain")})
    assert r.status_code == 415

def test_bad_image():
    r = client.post("/api/v1/predict", files={"file": ("bad.png", b"not png", "image/png")})
    assert r.status_code == 422

def test_empty_image():
    r = client.post("/api/v1/predict", files={"file": ("bad.png", b"", "image/png")})
    assert r.status_code == 400

def test_threshold_validation():
    r = client.post("/api/v1/predict?conf=2", files={"file": ("x.png", png(), "image/png")})
    assert r.status_code == 422

def test_contract_with_mocked_inference(monkeypatch):
    from app.schemas.prediction import Detection, ClassCount
    fake = Detection(model_class_id=0, source_category_id=1, class_name="test", source_name="test", confidence=.81, bbox_xyxy=[1,2,30,40])
    monkeypatch.setattr(engine, "predict", lambda image, conf, iou, imgsz: ([fake], [ClassCount(model_class_id=0, source_category_id=1, class_name="test", count=1)], 5.0))
    r = client.post("/api/v1/predict", files={"file": ("x.png", png(), "image/png")})
    assert r.status_code == 200
    assert r.json()["total_count"] == 1
    assert r.json()["image_width"] == 64
    assert r.json()["detections"][0]["bbox_xyxy"] == [1, 2, 30, 40]
