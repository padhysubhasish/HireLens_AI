"""
The LLM is never trusted to invent the final score. It only rates each
category (0-100); the backend applies a fixed, documented weighting to
produce the final match_score. This keeps the score explainable and
consistent, and is also documented in the README.
"""
from app.schemas.screening import AIAnalysisResult, CategoryScores

WEIGHTS = {
    "technical_skills": 0.40,
    "experience": 0.25,
    "ai_llm": 0.20,
    "preferred_requirements": 0.15,
}


def compute_weighted_score(scores: CategoryScores) -> int:
    total = (
        scores.technical_skills * WEIGHTS["technical_skills"]
        + scores.experience * WEIGHTS["experience"]
        + scores.ai_llm * WEIGHTS["ai_llm"]
        + scores.preferred_requirements * WEIGHTS["preferred_requirements"]
    )
    return round(total)


def score_to_level(score: int) -> str:
    if score >= 85:
        return "Strong Match"
    if score >= 70:
        return "Good Match"
    if score >= 50:
        return "Consider"
    return "Weak Match"


def apply_scoring(result: AIAnalysisResult) -> AIAnalysisResult:
    """Mutates match_score / match_level on the result based on category_scores."""
    result.match_score = compute_weighted_score(result.category_scores)
    result.match_level = score_to_level(result.match_score)
    return result
