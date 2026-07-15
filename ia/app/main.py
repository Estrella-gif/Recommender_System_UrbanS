from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes import router
from app.core.model_loader import ModelLoader


@asynccontextmanager
async def lifespan(app: FastAPI):
    loader = ModelLoader.get_instance()
    loader.load()
    yield


app = FastAPI(
    title="UrbanSoul Recommendation Service",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(router)
