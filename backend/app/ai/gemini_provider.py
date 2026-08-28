import google.generativeai as genai

from app.ai.base import AIProvider
from app.core.config import get_settings

settings = get_settings()


class GeminiProvider(AIProvider):
    def __init__(self):
        genai.configure(api_key=settings.gemini_api_key)
        self._model = genai.GenerativeModel(
            settings.gemini_model,
            generation_config={"response_mime_type": "application/json"},
        )

    def generate_json(self, system_prompt: str, user_prompt: str) -> str:
        full_prompt = f"{system_prompt}\n\n{user_prompt}"
        response = self._model.generate_content(full_prompt)
        return response.text or "{}"
