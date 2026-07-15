import pickle
import sys
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.recommender import RecommenderService


@patch("app.core.model_loader.ModelLoader.get_instance")
def test_recommender_returns_cached_user(mock_loader):
    mock_loader.return_value.recommendations = {
        123: [{"product_id": 1, "score": 0.95, "category_code": "a.bag", "brand": "x", "price": 10.0}],
    }
    mock_loader.return_value.popular_items = []
    svc = RecommenderService()
    recs = svc.get_recommendations(123)
    assert len(recs) == 1
    assert recs[0]["product_id"] == 1


@patch("app.core.model_loader.ModelLoader.get_instance")
def test_recommender_fallback_for_unknown_user(mock_loader):
    mock_loader.return_value.recommendations = {}
    mock_loader.return_value.popular_items = [
        {"product_id": 99, "score": 0.0, "category_code": "a.hat", "brand": "z", "price": 30.0},
    ]
    svc = RecommenderService()
    recs = svc.get_recommendations(999)
    assert len(recs) == 1
    assert recs[0]["product_id"] == 99


@patch("app.core.model_loader.ModelLoader.get_instance")
def test_recommender_respects_top_n(mock_loader):
    items = [
        {"product_id": i, "score": 1.0 - i * 0.1, "category_code": "a", "brand": "b", "price": 1.0}
        for i in range(20)
    ]
    mock_loader.return_value.recommendations = {1: items}
    mock_loader.return_value.popular_items = []
    svc = RecommenderService()
    recs = svc.get_recommendations(1, top_n=5)
    assert len(recs) == 5
