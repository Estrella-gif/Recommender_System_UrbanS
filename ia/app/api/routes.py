from fastapi import APIRouter, Query

from app.models.schemas import RecommendationItem, RecommendationResponse
from app.services.recommender import RecommenderService

router = APIRouter()
service = RecommenderService()


@router.get(
    "/recommendations/{user_id}",
    response_model=RecommendationResponse,
)
def get_recommendations(
    user_id: int,
    top_n: int = Query(default=10, ge=1, le=50),
):
    items = service.get_recommendations(user_id, top_n=top_n)
    return RecommendationResponse(
        user_id=user_id,
        recommendations=[
            RecommendationItem(**item) for item in items
        ],
    )
