import pickle
from pathlib import Path

from app.core.config import CACHE_PATH


class ModelLoader:
    _instance = None

    def __init__(self) -> None:
        self.cache: dict = {}

    @classmethod
    def get_instance(cls) -> "ModelLoader":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load(self) -> None:
        if not CACHE_PATH.exists():
            raise FileNotFoundError(
                f"Cache not found at {CACHE_PATH}. Run batch_job.py first."
            )
        with open(CACHE_PATH, "rb") as f:
            self.cache = pickle.load(f)

    @property
    def recommendations(self) -> dict:
        return self.cache.get("recommendations", {})

    @property
    def popular_items(self) -> list[dict]:
        return self.cache.get("popular_items", [])
