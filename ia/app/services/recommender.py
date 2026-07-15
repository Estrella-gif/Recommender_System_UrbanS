from app.core.model_loader import ModelLoader


class RecommenderService:
    @property
    def _loader(self) -> ModelLoader:
        return ModelLoader.get_instance()

    def get_recommendations(
        self, user_id: int, top_n: int | None = None
    ) -> list[dict]:
        recs = self._loader.recommendations.get(user_id)
        if recs is None:
            recs = self._loader.popular_items
        if top_n is not None:
            recs = recs[:top_n]
        return recs
