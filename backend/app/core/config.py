"""
Central application settings, loaded from environment variables / .env.

Everything that changes between environments (dev, docker, prod) lives here
so the rest of the codebase never reads os.environ directly.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://postgres:postgres@db:5432/resume_screener"

    # Auth
    jwt_secret: str = "change-this-secret"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24

    # AI provider
    ai_provider: str = "openai"  # "openai" | "gemini"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"
    demo_mode: bool = True

    # Uploads
    max_upload_size_mb: int = 10
    upload_dir: str = "/app/uploaded_resumes"

    # CORS
    frontend_url: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
