from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, PlainTextResponse

from app.services.demo_seed import sample_job_description_path, sample_resume_path

router = APIRouter(prefix="/api/samples", tags=["samples"])


@router.get("/job-description", response_class=PlainTextResponse)
def get_sample_job_description():
    path = sample_job_description_path()
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Sample job description not found")


@router.get("/resume")
def get_sample_resume():
    path = sample_resume_path()
    return FileResponse(path, media_type="application/pdf", filename="sample_resume.pdf")
