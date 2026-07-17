from fastapi import APIRouter, Query
from pydantic import BaseModel
from datetime import datetime
import random

from app.models.schemas import RecommendationItem, RecommendationResponse
from app.services.recommender import RecommenderService

router = APIRouter()
service = RecommenderService()

# Nota: En una refactorización futura, puedes mover esta clase a tu archivo app.models.schemas
class ModelMetrics(BaseModel):
    modelType: str
    precision: float
    recall: float
    latencyMs: int
    timestamp: datetime


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


@router.get("/metrics", response_model=ModelMetrics)
async def get_metrics(modelType: str = Query(default="HYBRID", alias="modelType")):
    """
    Endpoint para proveer métricas del modelo al frontend en Angular.
    """
    # Por ahora enviamos datos generados dinámicamente desde el backend 
    # para validar que la conexión HTTP funciona. Una vez validado, 
    # conectaremos esto con los resultados reales del caché.
    precision_val = random.uniform(0.85, 0.99)
    recall_val = random.uniform(0.80, 0.95)
    latency_val = random.randint(50, 150)
    
    return ModelMetrics(
        modelType=modelType,
        precision=precision_val,
        recall=recall_val,
        latencyMs=latency_val,
        timestamp=datetime.now()
    )