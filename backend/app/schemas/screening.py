from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field, field_validator

SkillStatus = Literal["strong", "good", "partial", "missing"]
MatchLevel = Literal["Strong Match", "Good Match", "Consider", "Weak Match"]


class CategoryScores(BaseModel):
    technical_skills: int = Field(ge=0, le=100)
    experience: int = Field(ge=0, le=100)
    ai_llm: int = Field(ge=0, le=100)
    preferred_requirements: int = Field(ge=0, le=100)


class SkillEvaluation(BaseModel):
    name: str
    status: SkillStatus
    evidence: str


class AIAnalysisResult(BaseModel):
    """
    The exact structured shape we require the LLM to return (or that DEMO_MODE
    fabricates deterministically). Validated with Pydantic before it ever
    reaches the frontend or the database.
    """
    candidate_name: str
    target_role: str
    category_scores: CategoryScores
    skills: list[SkillEvaluation]
    strengths: list[str]
    skill_gaps: list[str]
    experience_summary: str
    recommendation: str
    recommendation_reason: str
    confidence: float = Field(ge=0, le=1)

    # match_score / match_level are computed by our own scoring service from
    # category_scores, NOT trusted verbatim from the LLM. They're included
    # here so the object is self-contained after scoring is applied.
    match_score: int = Field(default=0, ge=0, le=100)
    match_level: str = ""

    @field_validator("skills")
    @classmethod
    def non_empty_skills(cls, v):
        if not v:
            raise ValueError("skills list must not be empty")
        return v


class ScreeningCreateRequest(BaseModel):
    resume_id: str
    job_description: str = Field(min_length=20, max_length=20000)


class ScreeningListItem(BaseModel):
    id: str
    candidate_name: str | None
    target_role: str | None
    match_score: int
    match_level: str
    created_at: datetime

    class Config:
        from_attributes = True


class ScreeningDetailOut(BaseModel):
    id: str
    resume_id: str
    job_description: str
    match_score: int
    match_level: str
    ai_result: AIAnalysisResult
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_resumes: int
    total_screenings: int
    average_match_score: float
    strong_matches: int
    recent_screenings: list[ScreeningListItem]
