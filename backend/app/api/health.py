from fastapi import APIRouter
from sqlalchemy import text

from app.core.database import engine
from app.core.config import get_settings

router = APIRouter(tags=["health"])
settings = get_settings()


@router.get("/api/health")
def health_check():
    db_status = "ok"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as exc:
        db_status = f"error: {exc}"

    return {
        "status": "ok",
        "database": db_status,
        "demo_mode": settings.demo_mode,
        "ai_provider": settings.ai_provider,
    }
