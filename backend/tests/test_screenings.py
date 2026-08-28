import io
import os


def _sample_pdf_bytes():
    path = os.path.join(os.path.dirname(__file__), "..", "sample_data", "sample_resume.pdf")
    with open(path, "rb") as f:
        return f.read()


def _upload_sample_resume(client, headers):
    resp = client.post(
        "/api/resumes/upload",
        headers=headers,
        files={"file": ("sample_resume.pdf", io.BytesIO(_sample_pdf_bytes()), "application/pdf")},
    )
    return resp.json()["id"]


SAMPLE_JD = (
    "Full-Stack AI Developer. Requirements: Strong Python programming skills, "
    "Experience with FastAPI, Strong React and JavaScript knowledge, PostgreSQL "
    "experience, REST API development, Experience integrating OpenAI or Gemini "
    "APIs, Docker experience, Git and GitHub. Preferred: AWS, Kubernetes, CI/CD."
)


def test_create_screening_demo_mode(client, auth_headers):
    resume_id = _upload_sample_resume(client, auth_headers)
    resp = client.post(
        "/api/screenings",
        headers=auth_headers,
        json={"resume_id": resume_id, "job_description": SAMPLE_JD},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert 0 <= body["match_score"] <= 100
    assert body["match_level"] in {"Strong Match", "Good Match", "Consider", "Weak Match"}
    assert "skills" in body["ai_result"]
    assert len(body["ai_result"]["strengths"]) > 0


def test_create_screening_empty_jd_rejected(client, auth_headers):
    resume_id = _upload_sample_resume(client, auth_headers)
    resp = client.post(
        "/api/screenings",
        headers=auth_headers,
        json={"resume_id": resume_id, "job_description": "too short"},
    )
    # min_length=20 in the Pydantic schema rejects this before it reaches the route
    assert resp.status_code == 422


def test_create_screening_unknown_resume_404(client, auth_headers):
    resp = client.post(
        "/api/screenings",
        headers=auth_headers,
        json={"resume_id": "00000000-0000-0000-0000-000000000000", "job_description": SAMPLE_JD},
    )
    assert resp.status_code == 404


def test_screening_history_and_delete(client, auth_headers):
    resume_id = _upload_sample_resume(client, auth_headers)
    create_resp = client.post(
        "/api/screenings", headers=auth_headers, json={"resume_id": resume_id, "job_description": SAMPLE_JD}
    )
    screening_id = create_resp.json()["id"]

    list_resp = client.get("/api/screenings", headers=auth_headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 1

    detail_resp = client.get(f"/api/screenings/{screening_id}", headers=auth_headers)
    assert detail_resp.status_code == 200

    delete_resp = client.delete(f"/api/screenings/{screening_id}", headers=auth_headers)
    assert delete_resp.status_code == 204

    list_resp_after = client.get("/api/screenings", headers=auth_headers)
    assert list_resp_after.json() == []


def test_dashboard_stats(client, auth_headers):
    resume_id = _upload_sample_resume(client, auth_headers)
    client.post("/api/screenings", headers=auth_headers, json={"resume_id": resume_id, "job_description": SAMPLE_JD})

    resp = client.get("/api/dashboard/stats", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["total_resumes"] == 1
    assert body["total_screenings"] == 1
    assert len(body["recent_screenings"]) == 1
