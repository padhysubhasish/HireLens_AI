import json
import logging

from pydantic import ValidationError

from app.ai.base import AIProvider
from app.ai.demo_data import generate_demo_result
from app.ai.prompt import SYSTEM_PROMPT, build_user_prompt
from app.core.config import get_settings
from app.schemas.screening import AIAnalysisResult

logger = logging.getLogger(__name__)
settings = get_settings()


class AIServiceError(Exception):
    """Raised when the AI provider fails or returns unusable output after retries."""


class AIService:
    """
    The single entry point the rest of the backend uses for resume analysis.
    Callers never know or care whether we're in demo mode or which provider
    (OpenAI/Gemini) is configured - that's all resolved here.
    """

    def __init__(self, provider: AIProvider | None = None):
        self._provider = provider

    def _get_provider(self) -> AIProvider:
        if self._provider is not None:
            return self._provider
        if settings.ai_provider == "gemini":
            from app.ai.gemini_provider import GeminiProvider
            return GeminiProvider()
        from app.ai.openai_provider import OpenAIProvider
        return OpenAIProvider()

    def analyze(self, resume_text: str, job_description: str, candidate_name_hint: str = "") -> AIAnalysisResult:
        if settings.demo_mode:
            return generate_demo_result(resume_text, job_description, candidate_name_hint or "Candidate")

        provider = self._get_provider()
        user_prompt = build_user_prompt(resume_text, job_description)

        last_error: Exception | None = None
        for attempt in range(1, 3):  # try twice before giving up
            try:
                raw = provider.generate_json(SYSTEM_PROMPT, user_prompt)
                cleaned = _strip_code_fences(raw)
                data = json.loads(cleaned)
                return AIAnalysisResult(**data)
            except (json.JSONDecodeError, ValidationError) as exc:
                last_error = exc
                logger.warning("AI response invalid on attempt %s: %s", attempt, exc)
            except Exception as exc:  # provider-level failure (network, auth, etc.)
                last_error = exc
                logger.error("AI provider call failed on attempt %s: %s", attempt, exc)

        raise AIServiceError(f"AI provider failed to return a valid structured result: {last_error}")


def _strip_code_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
    return text.strip()
