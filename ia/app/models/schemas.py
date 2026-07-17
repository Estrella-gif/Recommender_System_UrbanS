from pydantic import BaseModel, Field


class RecommendationItem(BaseModel):
    product_id: int
    score: float
    category_code: str | None = None
    brand: str | None = None
    price: float | None = None


class RecommendationResponse(BaseModel):
    user_id: int
    recommendations: list[RecommendationItem]
