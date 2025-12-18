from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch, MagicMock

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@patch("app.api.endpoints.analysis.get_genai_model")
def test_analyze_endpoint_mock(mock_get_model):
    # Setup mock to return None, forcing fallback to MOCK_ANALYSIS
    mock_get_model.return_value = None

    payload = {
        "name": "Test User",
        "birthDate": "1990-01-01",
        "birthTime": "12:00",
        "birthLocation": "New York, NY",
        "designType": "Generator",
        "enneagram": "Type 1"
    }

    response = client.post("/api/analyze", json=payload)

    assert response.status_code == 200
    data = response.json()

    # Verify structure matches strict schema
    assert "daily_lesson" in data
    assert "visual_symbol" in data["daily_lesson"]
    assert data["daily_lesson"]["visual_symbol"] in ['SPIRAL', 'TUNNEL', 'LATTICE', 'WEB', 'MANDALA']
    assert "headline" in data
    assert "narrative" in data
    assert "relational_geometry" in data

def test_analyze_endpoint_structure():
    # Test that the MOCK_ANALYSIS itself matches schema
    from app.api.endpoints.analysis import MOCK_ANALYSIS

    assert "daily_lesson" in MOCK_ANALYSIS
    assert "visual_symbol" in MOCK_ANALYSIS["daily_lesson"]
    # Check if mock uses valid symbol
    assert MOCK_ANALYSIS["daily_lesson"]["visual_symbol"] in ['SPIRAL', 'TUNNEL', 'LATTICE', 'WEB', 'MANDALA']
