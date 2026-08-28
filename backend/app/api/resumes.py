from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.database import get_db
from app.models.models import User
from app.repositories import resume_repository
from app.schemas.resume import ResumeDetailOut, ResumeOut
from app.services.file_storage import save_upload
from app.services.pdf_service import PDFExtractionError, extract_text_from_pdf, guess_candidate_name

router = APIRouter(prefix="/api/resumes", tags=["resumes"])
settings = get_settings()


@router.post("/upload", response_model=ResumeDetailOut, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if file.content_type != "application/pdf" and not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are supported")

    file_bytes = await file.read()
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is {settings.max_upload_size_mb} MB",
        )
    if len(file_bytes) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The uploaded file is empty")

    try:
        extracted_text = extract_text_from_pdf(file_bytes)
    except PDFExtractionError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))

    candidate_name = guess_candidate_name(extracted_text)
    file_path = save_upload(file_bytes, file.filename)

    resume = resume_repository.create_resume(
        db,
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        candidate_name=candidate_name,
        extracted_text=extracted_text,
    )
    return resume


@router.get("", response_model=list[ResumeOut])
def list_resumes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return resume_repository.list_resumes(db, current_user.id)


@router.get("/{resume_id}", response_model=ResumeDetailOut)
def get_resume(resume_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = resume_repository.get_resume(db, current_user.id, resume_id)
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    return resume


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(resume_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = resume_repository.get_resume(db, current_user.id, resume_id)
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    resume_repository.delete_resume(db, resume)
