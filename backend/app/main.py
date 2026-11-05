from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.settings import CORS_ORIGINS
from app.api.routes.predict import router

app = FastAPI(title="RicePest Spotter API", version="0.1.0",
              description="Visible pest-object detection and counting; research/validation prototype")
app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS,
                   allow_methods=["GET", "POST"], allow_headers=["Content-Type"])
app.include_router(router)
