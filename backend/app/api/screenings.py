from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.ai.service import AIService, AIServiceError
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import User
from app.repositories import resume_repository, screening_repository
from app.schemas.screening import ScreeningCreateRequest, ScreeningDetailOut, ScreeningListItem
from app.services.scoring_service import apply_scoring

router = APIRouter(prefix="/api/screenings", tags=["screenings"])


@router.post("", response_model=ScreeningDetailOut, status_code=status.HTTP_201_CREATED)
def create_screening(
    payload: ScreeningCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = resume_repository.get_resume(db, current_user.id, payload.resume_id)
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    if not payload.job_description.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Job description cannot be empty")

    ai_service = AIService()
    try:
        result = ai_service.analyze(
            resume_text=resume.extracted_text,
            job_description=payload.job_description,
            candidate_name_hint=resume.candidate_name or "Candidate",
        )
    except AIServiceError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"AI analysis failed: {exc}")

    result = apply_scoring(result)

    screening = screening_repository.create_screening(
        db,
        user_id=current_user.id,
        resume_id=resume.id,
        job_description=payload.job_description,
        match_score=result.match_score,
        match_level=result.match_level,
        ai_result=result.model_dump(),
    )
    return _to_detail(screening)


@router.get("", response_model=list[ScreeningListItem])
def list_screenings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    screenings = screening_repository.list_screenings(db, current_user.id)
    return [
        ScreeningListItem(
            id=s.id,
            candidate_name=(s.ai_result or {}).get("candidate_name"),
            target_role=(s.ai_result or {}).get("target_role"),
            match_score=s.match_score,
            match_level=s.match_level,
            created_at=s.created_at,
        )
        for s in screenings
    ]


@router.get("/{screening_id}", response_model=ScreeningDetailOut)
def get_screening(screening_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    screening = screening_repository.get_screening(db, current_user.id, screening_id)
    if not screening:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Screening not found")
    return _to_detail(screening)


@router.delete("/{screening_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_screening(screening_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    screening = screening_repository.get_screening(db, current_user.id, screening_id)
    if not screening:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Screening not found")
    screening_repository.delete_screening(db, screening)


def _to_detail(screening) -> ScreeningDetailOut:
    return ScreeningDetailOut(
        id=screening.id,
        resume_id=screening.resume_id,
        job_description=screening.job_description,
        match_score=screening.match_score,
        match_level=screening.match_level,
        ai_result=screening.ai_result,
        created_at=screening.created_at,
    )
