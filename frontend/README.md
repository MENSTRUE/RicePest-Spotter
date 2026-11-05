# RicePest Spotter — React frontend

A functional **React + TypeScript + Vite** UI, connected to the original FastAPI YOLO model. It includes upload/drag-and-drop, bounding boxes on a canvas using the image's original pixel coordinate space, per-class counts, selected detection highlighting, adjustable confidence/IoU thresholds, export of annotated PNG/JSON, browser-session history, and separate working navigation views.

## Setup (Windows PowerShell)

```powershell
cd "D:\porto\100 day\day 32\RicePest Spotter\frontend"
npm install
npm run build
npm run dev
```

Open http://127.0.0.1:5173. Run backend on port 8000 first. Vite proxies `/api` in local development. If backend is hosted separately, set `VITE_API_URL` **at build time**, and configure matching CORS.

`/ready` triggers genuine checkpoint loading. No mocked predictions are displayed in production. UI session history stores predictions but not image bytes. A changed threshold only applies after pressing **Analyze image** again; downloaded annotated PNG reflects current bounding-box visibility. Confirm actual end-to-end inference manually using a licensed test image before marking the frontend integrated.

Scientific limitation: 30 model IDs preserve duplicate display labels at distinct source category IDs, no held-out independent test, and counts represent visible predictions, not a census. Public deployment needs authentication, abuse controls, and privacy review.
