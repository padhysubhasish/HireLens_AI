"""
When DEMO_MODE=true, make sure a convenient demo account exists so an
evaluator can log in immediately without registering. This runs once at
startup and is idempotent (safe to run every time the app boots).
"""
import logging
import os

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import hash_password
from app.repositories import user_repository
from app.models.models import User

logger = logging.getLogger(__name__)
settings = get_settings()

DEMO_EMAIL = "demo@example.com"
DEMO_PASSWORD = "Demo@12345"
DEMO_NAME = "Demo Recruiter"


def ensure_demo_account(db: Session) -> User:
    user = user_repository.get_by_email(db, DEMO_EMAIL)
    if user:
        return user
    logger.info("Creating demo account %s", DEMO_EMAIL)
    return user_repository.create_user(db, name=DEMO_NAME, email=DEMO_EMAIL, password_hash=hash_password(DEMO_PASSWORD))


def sample_job_description_path() -> str:
    here = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    return os.path.join(here, "sample_data", "sample_job_description.txt")


def sample_resume_path() -> str:
    here = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    return os.path.join(here, "sample_data", "sample_resume.pdf")
