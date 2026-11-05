# RicePest Spotter — FastAPI inference

Loads the **original, locally stored** `models/best.pt` with Ultralytics YOLO and validates the checkpoint's 30 class names against `reports/audit/class_id_mapping.csv`. Never falls back to fake detections. Do not load unknown/untrusted `.pt` files.

## Windows / PowerShell

```powershell
cd "D:\porto\100 day\day 32\RicePest Spotter\backend"
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Endpoints: `GET /api/v1/health` (process only), `GET /api/v1/ready` (loads and validates original model), `POST /api/v1/predict` (multipart `file`, optional `conf`, `iou`, `imgsz`). Docs: http://127.0.0.1:8000/docs.

The prediction response includes image dimensions, `bbox_xyxy` in **original image pixel coordinates**, original source category IDs, model class IDs, confidence, counts per class and total, and model/inference metadata. Counts are based on detector outputs at user-selected thresholds—not verified field insect population. No independent held-out test was available in the Kaggle study.

Configuration (env): `MODEL_PATH` (absolute or repo-relative), `DEVICE` (default `cpu`), `MAX_UPLOAD_MB` (default 10), `MAX_IMAGE_PIXELS` (default 20,000,000), `CORS_ORIGINS`. Requests are decoded into memory and not stored by this API. Limit deployment exposure; add authentication and rate limiting before public hosting. Unit API tests use a **mock**; only a `/ready` check and actual image request verify local checkpoint integration.
