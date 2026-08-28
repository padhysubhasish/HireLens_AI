def test_register_and_login(client):
    resp = client.post(
        "/api/auth/register",
        json={
            "name": "Jane Doe",
            "email": "jane@example.com",
            "password": "SecurePass1",
            "confirm_password": "SecurePass1",
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert "access_token" in body
    assert body["user"]["email"] == "jane@example.com"

    login_resp = client.post("/api/auth/login", json={"email": "jane@example.com", "password": "SecurePass1"})
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()


def test_register_duplicate_email_rejected(client):
    payload = {
        "name": "Jane Doe",
        "email": "dupe@example.com",
        "password": "SecurePass1",
        "confirm_password": "SecurePass1",
    }
    client.post("/api/auth/register", json=payload)
    resp = client.post("/api/auth/register", json=payload)
    assert resp.status_code == 400


def test_login_wrong_password_rejected(client):
    client.post(
        "/api/auth/register",
        json={"name": "A", "email": "a@example.com", "password": "SecurePass1", "confirm_password": "SecurePass1"},
    )
    resp = client.post("/api/auth/login", json={"email": "a@example.com", "password": "WrongPass1"})
    assert resp.status_code == 401


def test_me_requires_auth(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401


def test_me_with_token(client, auth_headers):
    resp = client.get("/api/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == "test@example.com"
