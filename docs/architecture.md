# Architecture

## Request lifecycle: running a screening

```
User                Frontend               Backend                          DB / AI
 │  upload PDF        │                       │                                │
 │───────────────────►│  POST /resumes/upload │                                │
 │                     │──────────────────────►│  validate type/size            │
 │                     │                       │  PyMuPDF: extract + clean text │
 │                     │                       │  save file, insert Resume row  │
 │                     │                       │────────────────────────────────►│ resumes
 │                     │◄──────────────────────│  201 { id, extracted_text, ... }│
 │  paste JD, click    │                       │                                │
 │  "Analyze Resume"   │                       │                                │
 │───────────────────►│ POST /screenings       │                                │
 │                     │  { resume_id, jd }    │                                │
 │                     │──────────────────────►│  load resume by (user, id)     │
 │                     │                       │  AIService.analyze(text, jd)   │
 │                     │                       │    DEMO_MODE=true  → demo_data │
 │                     │                       │    DEMO_MODE=false → provider  │
 │                     │                       │      OpenAIProvider /          │
 │                     │                       │      GeminiProvider            │
 │                     │                       │  parse + validate JSON         │
 │                     │                       │  (retry once on failure)       │
 │                     │                       │  scoring_service.apply_scoring │
 │                     │                       │  insert Screening row          │
 │                     │                       │────────────────────────────────►│ screenings
 │                     │◄──────────────────────│  201 { match_score, ai_result } │
 │◄────────────────────│ navigate to results   │                                │
```

## Why the score is backend-computed, not LLM-reported

LLMs are unreliable at consistent arithmetic and can be nudged by prompt
phrasing. Instead, the model only classifies each of 4 categories (0-100)
with supporting evidence. `scoring_service.py` applies a fixed weighting
(40/25/20/15) to compute `match_score`, and a fixed threshold table to derive
`match_level`. This means:

- The score is reproducible and auditable — you can recompute it by hand
  from the category scores shown in the UI
- Changing the weighting is a one-line change in one file, not a prompt
  engineering exercise
- The LLM's job is narrowed to what LLMs are actually good at: qualitative,
  evidence-based judgment per category

## Why AI provider logic is isolated in `app/ai/`

`AIProvider` (abstract base) + `OpenAIProvider` / `GeminiProvider`
(implementations) + `AIService` (orchestrator) is the only place that knows
about `openai` or `google.generativeai` as libraries. Everything else in the
backend — the screenings route, the scoring service, the schemas — talks
only to `AIService.analyze()` and gets back a validated `AIAnalysisResult`.
Adding a third provider (e.g. Anthropic) means adding one file that
implements `generate_json()`, plus one `if` branch in
`AIService._get_provider()`.

## Why DEMO_MODE reads the real resume text

A common shortcut for "demo mode" is to return the exact same hardcoded JSON
regardless of input. Instead, `app/ai/demo_data.py` runs simple regex/keyword
matching against the actual extracted resume text for a fixed list of
required/AI/preferred skills, and computes category scores from how many it
finds — so uploading a different resume in demo mode produces a visibly
different (if unsophisticated) result. This keeps the demo honest about what
it is (labeled clearly in the UI) while still exercising the full pipeline:
upload → extract → "analyze" → score → validate → persist → render.

## Data isolation

Every resume/screening lookup in `app/api/resumes.py` and
`app/api/screenings.py` filters by `user_id == current_user.id` at the
repository layer (`resume_repository.get_resume(db, user_id, resume_id)`),
not just at the route layer. A user requesting another user's resume or
screening ID gets a `404`, not a `403` — this avoids confirming that the
resource exists at all.
