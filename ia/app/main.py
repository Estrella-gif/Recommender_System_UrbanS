from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
