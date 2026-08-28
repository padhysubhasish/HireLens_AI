"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-08-27

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "resumes",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("filename", sa.String(500), nullable=False),
        sa.Column("file_path", sa.String(1000), nullable=False),
        sa.Column("candidate_name", sa.String(255), nullable=True),
        sa.Column("extracted_text", sa.Text, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_resumes_user_id", "resumes", ["user_id"])

    op.create_table(
        "screenings",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("resume_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("job_description", sa.Text, nullable=False),
        sa.Column("match_score", sa.Integer, nullable=False),
        sa.Column("match_level", sa.String(50), nullable=False),
        sa.Column("ai_result", postgresql.JSONB, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_screenings_user_id", "screenings", ["user_id"])
    op.create_index("ix_screenings_resume_id", "screenings", ["resume_id"])
    op.create_index("ix_screenings_created_at", "screenings", ["created_at"])


def downgrade() -> None:
    op.drop_table("screenings")
    op.drop_table("resumes")
    op.drop_table("users")
