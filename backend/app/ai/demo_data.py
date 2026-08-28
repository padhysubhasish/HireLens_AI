"""
Deterministic "AI" results used when DEMO_MODE=true, so the whole app can be
run and evaluated without any LLM API key. This still flows through the real
scoring service, the real Pydantic validation, and the real database - only
the LLM call itself is skipped.

We do a very lightweight keyword match against the resume text so the demo
result reacts sensibly to whatever resume was actually uploaded, rather than
being 100% hardcoded regardless of input.
"""
import re

from app.schemas.screening import AIAnalysisResult, CategoryScores, SkillEvaluation

# Skills we look for, tagged as required vs preferred, mirroring the sample JD.
REQUIRED_SKILLS = ["Python", "FastAPI", "React", "JavaScript", "PostgreSQL", "REST API", "Docker", "Git"]
AI_SKILLS = ["OpenAI", "Gemini", "LLM", "Machine Learning", "AI"]
PREFERRED_SKILLS = ["AWS", "Azure", "Kubernetes", "CI/CD"]


def _find_evidence(resume_text: str, skill: str) -> str | None:
    pattern = re.escape(skill)
    match = re.search(pattern, resume_text, re.IGNORECASE)
    if not match:
        return None
    start = max(0, match.start() - 40)
    end = min(len(resume_text), match.end() + 40)
    snippet = resume_text[start:end].strip().replace("\n", " ")
    return snippet


def generate_demo_result(resume_text: str, job_description: str, candidate_name: str) -> AIAnalysisResult:
    skills: list[SkillEvaluation] = []

    def evaluate(skill_list: list[str], strong_label="strong"):
        found = 0
        for skill in skill_list:
            evidence = _find_evidence(resume_text, skill)
            if evidence:
                found += 1
                skills.append(SkillEvaluation(name=skill, status=strong_label, evidence=evidence))
            else:
                skills.append(SkillEvaluation(name=skill, status="missing", evidence="No explicit evidence found in resume"))
        return found

    required_found = evaluate(REQUIRED_SKILLS, "strong")
    ai_found = evaluate(AI_SKILLS, "strong")
    preferred_found = evaluate(PREFERRED_SKILLS, "partial")

    technical_skills = round(100 * required_found / len(REQUIRED_SKILLS))
    ai_llm = round(100 * ai_found / len(AI_SKILLS))
    preferred_requirements = round(100 * preferred_found / len(PREFERRED_SKILLS))

    years_match = re.search(r"(\d+)\+?\s+years?", resume_text, re.IGNORECASE)
    years = int(years_match.group(1)) if years_match else 2
    experience = min(100, 55 + years * 10)

    strengths = [
        f"Demonstrated experience with {required_found} of {len(REQUIRED_SKILLS)} core technical skills required by the role",
        "Hands-on experience building and deploying full-stack web applications",
    ]
    if ai_found:
        strengths.append("Direct experience integrating LLM / AI APIs into real products")

    skill_gaps = [f"{s.name}: no clear evidence found in the resume" for s in skills if s.status == "missing"][:5]
    if not skill_gaps:
        skill_gaps = ["No significant skill gaps identified against the listed requirements"]

    return AIAnalysisResult(
        candidate_name=candidate_name,
        target_role=_guess_role(job_description),
        category_scores=CategoryScores(
            technical_skills=technical_skills,
            experience=experience,
            ai_llm=ai_llm,
            preferred_requirements=preferred_requirements,
        ),
        skills=skills,
        strengths=strengths,
        skill_gaps=skill_gaps,
        experience_summary=f"The candidate has approximately {years} years of relevant software development experience "
        f"(estimated from resume text; DEMO_MODE result).",
        recommendation="Proceed to technical interview" if technical_skills >= 60 else "Consider with reservations",
        recommendation_reason=(
            "This is a DEMO_MODE result generated deterministically from simple keyword matching against the "
            "resume text, standing in for a real LLM call so the app can be evaluated without an API key."
        ),
        confidence=0.75,
    )


def _guess_role(job_description: str) -> str:
    first_line = job_description.strip().splitlines()[0] if job_description.strip() else "Target Role"
    return first_line.strip()[:120] or "Target Role"
