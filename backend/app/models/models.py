import uuid
from datetime import datetime

from sqlalchemy import String, Text, ForeignKey, DateTime, Integer, JSON, func, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

# Portable across Postgres (production) and SQLite (unit tests):
# Postgres gets real JSONB, everything else falls back to generic JSON.
JSONType = JSON().with_variant(JSONB(), "postgresql")


def gen_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(Uuid(as_uuid=False), primary_key=True, default=gen_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    resumes: Mapped[list["Resume"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    screenings: Mapped[list["Screening"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[str] = mapped_column(Uuid(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(Uuid(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    filename: Mapped[str] = mapped_column(String(500))
    file_path: Mapped[str] = mapped_column(String(1000))
    candidate_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    extracted_text: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="resumes")
    screenings: Mapped[list["Screening"]] = relationship(back_populates="resume", cascade="all, delete-orphan")


class Screening(Base):
    __tablename__ = "screenings"

    id: Mapped[str] = mapped_column(Uuid(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(Uuid(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    resume_id: Mapped[str] = mapped_column(Uuid(as_uuid=False), ForeignKey("resumes.id", ondelete="CASCADE"), index=True)
    job_description: Mapped[str] = mapped_column(Text)
    match_score: Mapped[int] = mapped_column(Integer)
    match_level: Mapped[str] = mapped_column(String(50))
    ai_result: Mapped[dict] = mapped_column(JSONType)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)

    user: Mapped["User"] = relationship(back_populates="screenings")
    resume: Mapped["Resume"] = relationship(back_populates="screenings")
