from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import claims_router, era_router, analytics_router
from app.core.config import settings

app = FastAPI(title="RCM API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(claims_router.router)
app.include_router(era_router.router)
app.include_router(analytics_router.router)


