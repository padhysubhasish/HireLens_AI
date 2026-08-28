import logging

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api import auth, dashboard, health, resumes, samples, screenings
from app.core.config import get_settings
from app.core.database import Base, SessionLocal, engine
from app.services.demo_seed import ensure_demo_account

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(
    title="TalentLens AI",
    description="Screen smarter. Hire with confidence.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(resumes.router)
app.include_router(screenings.router)
app.include_router(dashboard.router)
app.include_router(samples.router)
app.include_router(health.router)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc: StarletteHTTPException):
    # Never leak raw stack traces to the client.
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"detail": "Invalid request", "errors": exc.errors()})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc: Exception):
    logger.exception("Unhandled server error")
    return JSONResponse(status_code=500, content={"detail": "An unexpected error occurred. Please try again."})


@app.on_event("startup")
def on_startup():
    # Tables are normally managed by Alembic migrations (see alembic/ folder).
    # create_all() is a safety net for quick local runs.
    Base.metadata.create_all(bind=engine)

    if settings.demo_mode:
        db = SessionLocal()
        try:
            ensure_demo_account(db)
        finally:
            db.close()
