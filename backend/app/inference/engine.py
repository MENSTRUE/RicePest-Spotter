"""Load the user's locally verified YOLO11 checkpoint, never a demo substitute.

Only load trusted PyTorch checkpoints. Torch serialization may execute code.
"""
import csv
import threading
import time
from app.core.settings import MODEL_PATH, MAPPING_PATH, DEVICE
from app.schemas.prediction import Detection, ClassCount

class ModelUnavailable(RuntimeError):
    pass

class DetectorEngine:
    def __init__(self):
        self._lock = threading.RLock()
        self.model = None
        self.error = "Not loaded"
        self.class_names: dict[int, str] = {}
        self.source_ids: dict[int, int] = {}
        self.source_names: dict[int, str] = {}
        self.model_name = "YOLO11n · RicePest-30"

    def load(self):
        with self._lock:
            if self.model is not None:
                return
            if not MODEL_PATH.is_file():
                self.error = f"Checkpoint missing: {MODEL_PATH}. Copy the original Kaggle best.pt to models/."
                raise ModelUnavailable(self.error)
            try:
                from ultralytics import YOLO
                model = YOLO(str(MODEL_PATH), task="detect")
                names = {int(k): str(v) for k, v in model.names.items()}
                if set(names) != set(range(30)):
                    raise ValueError(f"Expected model IDs 0..29; got {sorted(names)}")
                source_ids = {}
                source_names = {}
                if MAPPING_PATH.is_file():
                    with MAPPING_PATH.open(newline="", encoding="utf-8-sig") as f:
                        rows = list(csv.DictReader(f))
                    if len(rows) != 30:
                        raise ValueError("Expected exactly 30 class mapping rows")
                    for row in rows:
                        i = int(row["yolo_id"])
                        if i in source_ids:
                            raise ValueError(f"Duplicate mapping ID {i}")
                        if names.get(i) != row["model_name"]:
                            raise ValueError(f"Checkpoint class mismatch at ID {i}: {names.get(i)!r} vs {row['model_name']!r}")
                        source_ids[i] = int(row["source_category_id"])
                        source_names[i] = row["original_name"]
                    if set(source_ids) != set(names):
                        raise ValueError("Class mapping incomplete")
                else:
                    raise ValueError(f"Original category mapping missing: {MAPPING_PATH}")
                self.model = model
                self.class_names = names
                self.source_ids = source_ids
                self.source_names = source_names
                self.model_name = f"YOLO11n · {MODEL_PATH.name}"
                self.error = ""
            except Exception as exc:
                self.error = f"Model incompatible or unavailable: {type(exc).__name__}: {exc}"
                raise ModelUnavailable(self.error) from exc

    def predict(self, image, conf: float, iou: float, imgsz: int):
        self.load()
        start = time.perf_counter()
        with self._lock:
            results = self.model.predict(source=image, conf=conf, iou=iou, imgsz=imgsz,
                                         device=DEVICE, verbose=False, max_det=300)
        elapsed = (time.perf_counter() - start) * 1000
        if len(results) != 1:
            raise ModelUnavailable("Unexpected inference result count")
        r = results[0]
        detections = []
        counts: dict[int, int] = {}
        h, w = image.height, image.width
        if r.boxes is not None:
            for box in r.boxes:
                idx = int(box.cls.item())
                if idx not in self.class_names:
                    raise ModelUnavailable(f"Unknown inference class ID {idx}")
                xyxy = [float(x) for x in box.xyxy[0].tolist()]
                xyxy = [max(0.0, min(float(w if j % 2 == 0 else h), v)) for j, v in enumerate(xyxy)]
                detections.append(Detection(model_class_id=idx, source_category_id=self.source_ids[idx],
                    class_name=self.class_names[idx], source_name=self.source_names[idx],
                    confidence=float(box.conf.item()), bbox_xyxy=xyxy))
                counts[idx] = counts.get(idx, 0) + 1
        groups = [ClassCount(model_class_id=idx, source_category_id=self.source_ids[idx],
                            class_name=self.class_names[idx], count=n)
                  for idx, n in sorted(counts.items(), key=lambda x: (-x[1], x[0]))]
        return detections, groups, elapsed

engine = DetectorEngine()
