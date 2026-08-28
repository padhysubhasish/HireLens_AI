from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.models.models import Screening


def create_screening(
    db: Session,
    user_id: str,
    resume_id: str,
    job_description: str,
    match_score: int,
    match_level: str,
    ai_result: dict,
) -> Screening:
    screening = Screening(
        user_id=user_id,
        resume_id=resume_id,
        job_description=job_description,
        match_score=match_score,
        match_level=match_level,
        ai_result=ai_result,
    )
    db.add(screening)
    db.commit()
    db.refresh(screening)
    return screening


def list_screenings(db: Session, user_id: str) -> list[Screening]:
    return db.query(Screening).filter(Screening.user_id == user_id).order_by(desc(Screening.created_at)).all()


def get_screening(db: Session, user_id: str, screening_id: str) -> Screening | None:
    return db.query(Screening).filter(Screening.user_id == user_id, Screening.id == screening_id).first()


def delete_screening(db: Session, screening: Screening) -> None:
    db.delete(screening)
    db.commit()


def dashboard_stats(db: Session, user_id: str) -> dict:
    total_screenings = db.query(func.count(Screening.id)).filter(Screening.user_id == user_id).scalar() or 0
    avg_score = db.query(func.avg(Screening.match_score)).filter(Screening.user_id == user_id).scalar() or 0
    strong_matches = (
        db.query(func.count(Screening.id))
        .filter(Screening.user_id == user_id, Screening.match_level == "Strong Match")
        .scalar()
        or 0
    )
    return {
        "total_screenings": total_screenings,
        "average_match_score": round(float(avg_score), 1),
        "strong_matches": strong_matches,
    }
