from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch, MagicMock

client = TestClient(app)

@patch("app.api.endpoints.therapist.firestore")
def test_share_endpoint(mock_firestore):
    # Mock Firestore client
    mock_db = MagicMock()
    mock_firestore.client.return_value = mock_db

    payload = {
        "user_id": "test_user_123",
        "therapist_email": "doctor@example.com",
        "duration_days": 30
    }

    response = client.post("/api/therapist/share", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert "share_id" in data
    assert "share_link" in data
    assert "defrag.app" in data["share_link"]

    # Verify Firestore call
    mock_db.collection.assert_called()

@patch("app.api.endpoints.therapist.firestore")
def test_revoke_endpoint(mock_firestore):
    mock_db = MagicMock()
    mock_firestore.client.return_value = mock_db

    payload = {
        "user_id": "test_user_123",
        "share_id": "share_123"
    }

    response = client.post("/api/therapist/revoke", json=payload)

    assert response.status_code == 200
    assert response.json()["status"] == "success"
