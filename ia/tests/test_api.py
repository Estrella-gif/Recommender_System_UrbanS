import sys
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient


@patch("app.core.model_loader.ModelLoader.get_instance")
def test_api_returns_recommendations(mock_loader):
    mock_loader.return_value.recommendations = {
        456: [{"product_id": 10, "score": 0.88, "category_code": "a.shoe", "brand": "nike", "price": 50.0}],
    }
    mock_loader.return_value.popular_items = []

    from app.main import app
    client = TestClient(app)
    response = client.get("/recommendations/456?top_n=10")
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == 456
    assert len(data["recommendations"]) == 1
    assert data["recommendations"][0]["product_id"] == 10


@patch("app.core.model_loader.ModelLoader.get_instance")
def test_api_unknown_user_returns_popular(mock_loader):
    mock_loader.return_value.recommendations = {}
    mock_loader.return_value.popular_items = [
        {"product_id": 1, "score": 0.0, "category_code": "a.bag", "brand": "x", "price": 10.0},
    ]

    from app.main import app
    client = TestClient(app)
    response = client.get("/recommendations/999")
    assert response.status_code == 200
    data = response.json()
    assert len(data["recommendations"]) == 1
    assert data["recommendations"][0]["product_id"] == 1
