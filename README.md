# TalentLens AI

**Screen smarter. Hire with confidence.**

An end-to-end AI resume screener: upload a candidate's PDF resume, paste a job
description, and get a structured, evidence-based match score with category
breakdowns, matched/missing skills, strengths, gaps, and a hiring
recommendation — backed by a real Postgres-stored screening history.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Design](#database-design)
- [API Documentation](#api-documentation)
- [AI Integration](#ai-integration)
- [Scoring Methodology](#scoring-methodology)
- [Demo Mode](#demo-mode)
- [Local Setup](#local-setup)
- [Docker Setup](#docker-setup)
- [Environment Variables](#environment-variables)
- [Sample Credentials](#sample-credentials)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Future Improvements](#future-improvements)
- [Known Limitations](#known-limitations)

---

## Project Overview

TalentLens AI lets a recruiter register, log in, upload a resume, paste a job
description, and run an AI-powered screening. The result is validated,
structured JSON — not free text — covering category scores, per-skill
evidence, strengths, gaps, and a recommendation. Every screening is saved to
Postgres so recruiters can build a searchable history.

## Features

- Email/password auth (JWT) with a one-click demo login
- Drag-and-drop PDF resume upload with validation (type, size)
- Paste-in job description with character count and a "Load Sample Data" button
- AI analysis producing: overall match score, 4 category scores, per-skill
  status + evidence, strengths, skill gaps, and a recommendation
- Backend-computed, documented, weighted scoring (the LLM never invents the
  final number)
- Full screening history: search, filter by match level, sort by date, pagination
- `DEMO_MODE` — the entire app works with zero API key configured
- User-scoped data isolation (JWT-protected, ownership-checked endpoints)

## Tech Stack

**Frontend:** React + Vite, Tailwind CSS, React Router, Axios, Recharts-ready, lucide-react icons
**Backend:** FastAPI, Pydantic, SQLAlchemy 2.0, Alembic, PyMuPDF, JWT (python-jose), passlib/bcrypt
**Database:** PostgreSQL
**AI:** Provider abstraction supporting OpenAI and Google Gemini
**Infra:** Docker + Docker Compose (three services: db, backend, frontend)

## Architecture

```
Frontend (React/Vite, :5173)
        │  REST + JWT
        ▼
Backend (FastAPI, :8000)
        │
        ├── PostgreSQL (:5432)      — users, resumes, screenings
        ├── PDF Parser (PyMuPDF)    — extracts + cleans resume text
        └── AIService               — provider-agnostic LLM orchestration
                ├── OpenAIProvider
                └── GeminiProvider
```

The backend never lets the frontend or the rest of the app know which LLM
provider is active — `AIService.analyze()` is the single call site, and it
either returns a `DEMO_MODE` deterministic result or delegates to whichever
`AIProvider` is configured via `AI_PROVIDER`.

See [`docs/architecture.md`](docs/architecture.md) for more detail, including
the request lifecycle for a screening.

## Database Design

Three tables, related by foreign key, each user-scoped:

```
users
  id (uuid, pk), name, email (unique), password_hash, created_at

resumes
  id (uuid, pk), user_id (fk → users), filename, file_path,
  candidate_name, extracted_text, created_at

screenings
  id (uuid, pk), user_id (fk → users), resume_id (fk → resumes),
  job_description, match_score, match_level, ai_result (jsonb), created_at
```

`ai_result` stores the full validated `AIAnalysisResult` JSON (category
scores, skills, strengths, gaps, recommendation) so a screening can be
re-rendered exactly as it was without recalculating anything. Indexes exist
on all foreign keys and on `screenings.created_at` for history sorting.
Migrations are managed with Alembic (`backend/alembic/versions/0001_initial.py`).

## API Documentation

Interactive Swagger docs are available at **`http://localhost:8000/docs`**
once the backend is running.

```
Auth
  POST   /api/auth/register
  POST   /api/auth/login
  GET    /api/auth/me

Resumes
  POST   /api/resumes/upload
  GET    /api/resumes
  GET    /api/resumes/{id}
  DELETE /api/resumes/{id}

Screenings
  POST   /api/screenings
  GET    /api/screenings
  GET    /api/screenings/{id}
  DELETE /api/screenings/{id}

Dashboard
  GET    /api/dashboard/stats

Samples (used by "Load Sample Data" in the UI)
  GET    /api/samples/job-description
  GET    /api/samples/resume

Health
  GET    /api/health
```

Every endpoint except `register`/`login`/`health`/`samples` requires a
`Authorization: Bearer <token>` header, and every resume/screening lookup is
scoped to `current_user.id` — a user can never read or delete another user's
data.

## AI Integration

Prompt engineering lives entirely in `backend/app/ai/prompt.py`, separate
from any API route. The system prompt explicitly instructs the model to:

- Distinguish `strong` / `good` / `partial` / `missing` per skill, with
  required evidence text for each
- Never assume a skill exists from loosely related wording (e.g. "cloud"
  mentioned does **not** imply "AWS")
- Never invent candidate experience — anything not found in the resume is
  `missing`
- Return **only** a single JSON object matching a fixed schema

The raw LLM response is parsed and validated against a Pydantic model
(`AIAnalysisResult`). If parsing or validation fails, `AIService` retries the
call once before raising a clear `502` error — the frontend shows a friendly
message rather than a stack trace.

Switching providers is one environment variable:

```env
AI_PROVIDER=openai   # or: gemini
```

No provider-specific code exists outside `backend/app/ai/`.

## Scoring Methodology

The LLM rates each category from 0–100. The **backend**, not the LLM,
computes the final score using a fixed, documented weighting:

| Category                | Weight |
|--------------------------|--------|
| Technical Skills         | 40%    |
| Relevant Experience      | 25%    |
| AI / LLM Experience      | 20%    |
| Preferred Requirements   | 15%    |

```
Weighted Score = 0.40 × technical_skills
               + 0.25 × experience
               + 0.20 × ai_llm
               + 0.15 × preferred_requirements
```

The resulting score maps to a match level:

| Score   | Match Level   |
|---------|---------------|
| ≥ 85    | Strong Match  |
| 70–84   | Good Match    |
| 50–69   | Consider      |
| < 50    | Weak Match    |

See `backend/app/services/scoring_service.py` — this is the single source of
truth for both the weights and the thresholds.

## Demo Mode

```env
DEMO_MODE=true
```

With demo mode on:

- No OpenAI/Gemini API key is required anywhere in the stack
- `AIService.analyze()` short-circuits to `app/ai/demo_data.py`, which does
  lightweight keyword matching against the **actual uploaded resume text**
  against a fixed skill list, so results react to whatever resume you upload
  rather than being 100% hardcoded
- The result still flows through the same Pydantic validation, the same
  scoring service, and the same Postgres storage as a real LLM call
- The UI shows an explicit **"Demo Mode result"** banner on the results page
  so it's never mistaken for a live LLM call
- A demo account (`demo@example.com` / `Demo@12345`) is auto-created on
  startup

To use a real LLM instead:

```env
DEMO_MODE=false
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

(or `AI_PROVIDER=gemini` with `GEMINI_API_KEY=...`). No other code changes
are needed — restart the backend and it will call the real provider.

## Local Setup

### Option A — Docker (recommended)

```bash
git clone <repository-url>
cd ai-resume-screener

cp .env.example .env
# (optional) edit .env to add a real OPENAI_API_KEY / GEMINI_API_KEY
# and set DEMO_MODE=false

docker compose up --build
```

Then open:

- Frontend: **http://localhost:5173**
- Backend docs: **http://localhost:8000/docs**

Log in with the [demo account](#sample-credentials), or register a new one,
then click **"Load Sample Data"** on the New Screening page to try it
immediately.

### Option B — Without Docker

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Point DATABASE_URL at a Postgres instance you have running locally, e.g.:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/resume_screener

alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

**Frontend** (separate terminal):

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:8000
npm run dev
```

## Docker Setup

`docker-compose.yml` defines three services:

| Service    | Description                              | Port |
|------------|-------------------------------------------|------|
| `db`       | PostgreSQL 16                             | 5432 |
| `backend`  | FastAPI, runs Alembic migrations on boot  | 8000 |
| `frontend` | Built React app served via `serve`        | 5173 |

The backend waits for Postgres's healthcheck before starting, and runs
`alembic upgrade head` automatically on container start.

## Environment Variables

Root `.env` (used by `docker compose`, backend service):

```env
JWT_SECRET=change-this-secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

AI_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
DEMO_MODE=true

MAX_UPLOAD_SIZE_MB=10
UPLOAD_DIR=/app/uploaded_resumes
FRONTEND_URL=http://localhost:5173
```

`backend/.env.example` mirrors this for non-Docker runs and additionally
includes `DATABASE_URL`. `frontend/.env.example` contains `VITE_API_URL`.
Never commit a real `.env` — only `.env.example` files are tracked.

## Sample Credentials

```
Email:    demo@example.com
Password: Demo@12345
```

Auto-created on backend startup whenever `DEMO_MODE=true`.

## Project Structure

```
ai-resume-screener/
├── frontend/
│   ├── src/
│   │   ├── components/   # Dropzone, badges, cards, dialogs, skeletons
│   │   ├── pages/         # Login, Register, Dashboard, NewScreening, Results, History, Settings
│   │   ├── layouts/        # Sidebar + responsive app shell
│   │   ├── context/        # Auth + Toast providers
│   │   └── services/       # Axios client + typed endpoint helpers
│   └── Dockerfile
├── backend/
│   ├── app/
│   │   ├── api/            # Route handlers (auth, resumes, screenings, dashboard, samples, health)
│   │   ├── ai/              # Provider interface, OpenAI/Gemini impls, prompt, demo data, orchestrator
│   │   ├── core/             # Config, DB session, security (JWT/bcrypt)
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/            # Pydantic request/response + AI result schema
│   │   ├── repositories/        # DB access layer
│   │   └── services/             # PDF extraction, scoring, file storage, demo seeding
│   ├── alembic/                   # Migrations
│   ├── sample_data/                # sample_resume.pdf + generator script, sample_job_description.txt
│   └── tests/
├── docker-compose.yml
├── .env.example
└── docs/architecture.md
```

## Testing

```bash
cd backend
pip install -r requirements.txt
pytest
```

Tests run against an isolated SQLite database (see `tests/conftest.py`) and
cover: registration/login, invalid credentials, protected-route auth,
resume upload validation (PDF-only, non-empty), user data isolation, the
full screening creation flow in `DEMO_MODE`, empty/invalid job description
rejection, unknown-resume 404 handling, screening history + delete, and
dashboard stats.

## Future Improvements

- OCR fallback for scanned/image-only PDFs
- Streaming the AI analysis stages to the frontend instead of client-side
  stage animation
- Bulk resume upload / batch screening
- Role-based access for recruiting teams (shared screenings)
- Export screening results to PDF/CSV

## Known Limitations

- No OCR: scanned/image-only PDFs are rejected with a clear error rather
  than processed
- `DEMO_MODE` results are deterministic keyword matching, not a real model —
  clearly labeled as such in the UI
- Single-tenant per user: screenings are not shared across recruiter accounts
- No password-reset flow
