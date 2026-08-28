from openai import OpenAI

from app.ai.base import AIProvider
from app.core.config import get_settings

settings = get_settings()


class OpenAIProvider(AIProvider):
    def __init__(self):
        self._client = OpenAI(api_key=settings.openai_api_key)
        self._model = settings.openai_model

    def generate_json(self, system_prompt: str, user_prompt: str) -> str:
        response = self._client.chat.completions.create(
            model=self._model,
            temperature=0.2,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        return response.choices[0].message.content or "{}"
