import io
import os


def _sample_pdf_bytes():
    path = os.path.join(os.path.dirname(__file__), "..", "sample_data", "sample_resume.pdf")
    with open(path, "rb") as f:
        return f.read()


def test_upload_resume_success(client, auth_headers):
    pdf_bytes = _sample_pdf_bytes()
    resp = client.post(
        "/api/resumes/upload",
        headers=auth_headers,
        files={"file": ("sample_resume.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["filename"] == "sample_resume.pdf"
    assert "Rahul" in body["extracted_text"] or len(body["extracted_text"]) > 30


def test_upload_rejects_non_pdf(client, auth_headers):
    resp = client.post(
        "/api/resumes/upload",
        headers=auth_headers,
        files={"file": ("resume.txt", io.BytesIO(b"not a pdf"), "text/plain")},
    )
    assert resp.status_code == 400


def test_upload_requires_auth(client):
    resp = client.post(
        "/api/resumes/upload",
        files={"file": ("sample_resume.pdf", io.BytesIO(_sample_pdf_bytes()), "application/pdf")},
    )
    assert resp.status_code == 401


def test_list_resumes_user_isolation(client, auth_headers):
    pdf_bytes = _sample_pdf_bytes()
    client.post(
        "/api/resumes/upload",
        headers=auth_headers,
        files={"file": ("sample_resume.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
    )

    other_resp = client.post(
        "/api/auth/register",
        json={"name": "Other", "email": "other@example.com", "password": "SecurePass1", "confirm_password": "SecurePass1"},
    )
    other_headers = {"Authorization": f"Bearer {other_resp.json()['access_token']}"}

    resp = client.get("/api/resumes", headers=other_headers)
    assert resp.status_code == 200
    assert resp.json() == []
