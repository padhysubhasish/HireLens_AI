from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import User
from app.repositories import resume_repository, screening_repository
from app.schemas.screening import DashboardStats, ScreeningListItem

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    stats = screening_repository.dashboard_stats(db, current_user.id)
    total_resumes = len(resume_repository.list_resumes(db, current_user.id))
    recent = screening_repository.list_screenings(db, current_user.id)[:5]

    return DashboardStats(
        total_resumes=total_resumes,
        total_screenings=stats["total_screenings"],
        average_match_score=stats["average_match_score"],
        strong_matches=stats["strong_matches"],
        recent_screenings=[
            ScreeningListItem(
                id=s.id,
                candidate_name=(s.ai_result or {}).get("candidate_name"),
                target_role=(s.ai_result or {}).get("target_role"),
                match_score=s.match_score,
                match_level=s.match_level,
                created_at=s.created_at,
            )
            for s in recent
        ],
    )
