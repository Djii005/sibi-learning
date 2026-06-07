"""End-to-end API tests for the SIBI backend."""

from __future__ import annotations

from fastapi.testclient import TestClient


def _register(client: TestClient, email: str = "demo@example.com") -> tuple[str, int]:
    res = client.post(
        "/api/auth/register",
        json={"email": email, "display_name": "Demo", "password": "password123"},
    )
    assert res.status_code == 201, res.text
    body = res.json()
    return body["access_token"], body["user"]["id"]


def test_health(client: TestClient) -> None:
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_register_login_me(client: TestClient) -> None:
    token, user_id = _register(client)

    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["id"] == user_id

    login = client.post(
        "/api/auth/login",
        json={"email": "demo@example.com", "password": "password123"},
    )
    assert login.status_code == 200
    assert login.json()["user"]["id"] == user_id

    dup = client.post(
        "/api/auth/register",
        json={"email": "demo@example.com", "display_name": "Demo", "password": "password123"},
    )
    assert dup.status_code == 409


def test_login_wrong_password(client: TestClient) -> None:
    _register(client)
    res = client.post(
        "/api/auth/login",
        json={"email": "demo@example.com", "password": "bad-password"},
    )
    assert res.status_code == 401


def test_lessons_are_seeded(client: TestClient) -> None:
    res = client.get("/api/lessons")
    assert res.status_code == 200
    slugs = {lesson["slug"] for lesson in res.json()}
    assert {"alphabet", "numbers", "greetings"} <= slugs

    alphabet = client.get("/api/lessons/alphabet").json()
    assert len(alphabet["signs"]) == 26
    assert alphabet["signs"][0]["label"] == "A"


def test_progress_tracking(client: TestClient) -> None:
    token, _ = _register(client)
    headers = {"Authorization": f"Bearer {token}"}

    alphabet = client.get("/api/lessons/alphabet").json()
    sign_id = alphabet["signs"][0]["id"]

    first = client.post(
        "/api/progress",
        headers=headers,
        json={"sign_id": sign_id, "score": 0.6, "correct": False},
    )
    assert first.status_code == 200
    assert first.json()["attempts"] == 1
    assert first.json()["correct"] == 0
    assert first.json()["best_score"] == 0.6

    second = client.post(
        "/api/progress",
        headers=headers,
        json={"sign_id": sign_id, "score": 0.95, "correct": True},
    )
    assert second.status_code == 200
    assert second.json()["attempts"] == 2
    assert second.json()["correct"] == 1
    assert second.json()["best_score"] == 0.95

    summary = client.get("/api/progress/summary", headers=headers).json()
    assert summary["mastered_signs"] == 1
    assert summary["total_signs"] == 41  # 26 letters + 10 numbers + 5 greetings
    assert summary["attempts"] == 2


def test_progress_requires_auth(client: TestClient) -> None:
    res = client.post(
        "/api/progress",
        json={"sign_id": 1, "score": 0.9, "correct": True},
    )
    assert res.status_code == 401


def test_unknown_lesson_404(client: TestClient) -> None:
    assert client.get("/api/lessons/does-not-exist").status_code == 404


def test_register_validation(client: TestClient) -> None:
    res = client.post(
        "/api/auth/register",
        json={"email": "demo@example.com", "display_name": "Demo", "password": "short"},
    )
    assert res.status_code == 422
