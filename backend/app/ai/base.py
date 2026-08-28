from abc import ABC, abstractmethod


class AIProvider(ABC):
    """
    Every LLM provider (OpenAI, Gemini, ...) implements this one method.
    Nothing outside app/ai/ should ever import openai or google.generativeai
    directly - the rest of the app only talks to AIProvider.
    """

    @abstractmethod
    def generate_json(self, system_prompt: str, user_prompt: str) -> str:
        """
        Send the prompts to the LLM and return the raw text response.
        The caller (AIService) is responsible for parsing/validating JSON.
        Implementations should ask the provider for JSON output where the
        provider API supports it (e.g. OpenAI's response_format).
        """
        raise NotImplementedError
