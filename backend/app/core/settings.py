from pathlib import Path
import os

ROOT = Path(__file__).resolve().parents[3]
MODEL_PATH = Path(os.getenv("MODEL_PATH", str(ROOT / "models" / "best.pt"))).expanduser()
if not MODEL_PATH.is_absolute():
    MODEL_PATH = (ROOT / MODEL_PATH).resolve()
MAPPING_PATH = ROOT / "reports" / "audit" / "class_id_mapping.csv"
DEVICE = os.getenv("DEVICE", "cpu")
MAX_UPLOAD_MB = max(1, min(int(os.getenv("MAX_UPLOAD_MB", "10")), 30))
MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024
MAX_PIXELS = max(100000, int(os.getenv("MAX_IMAGE_PIXELS", "20000000")))
CORS_ORIGINS = [x.strip() for x in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if x.strip()]
