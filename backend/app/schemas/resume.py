from datetime import datetime
from pydantic import BaseModel


class ResumeOut(BaseModel):
    id: str
    filename: str
    candidate_name: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class ResumeDetailOut(ResumeOut):
    extracted_text: str
