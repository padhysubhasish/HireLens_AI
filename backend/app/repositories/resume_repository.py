from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.models.models import Resume


def create_resume(db: Session, user_id: str, filename: str, file_path: str, candidate_name: str, extracted_text: str) -> Resume:
    resume = Resume(
        user_id=user_id,
        filename=filename,
        file_path=file_path,
        candidate_name=candidate_name,
        extracted_text=extracted_text,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume


def list_resumes(db: Session, user_id: str) -> list[Resume]:
    return db.query(Resume).filter(Resume.user_id == user_id).order_by(desc(Resume.created_at)).all()


def get_resume(db: Session, user_id: str, resume_id: str) -> Resume | None:
    return db.query(Resume).filter(Resume.user_id == user_id, Resume.id == resume_id).first()


def delete_resume(db: Session, resume: Resume) -> None:
    db.delete(resume)
    db.commit()
