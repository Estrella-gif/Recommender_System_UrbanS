from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

ML_DIR = BASE_DIR / "ml"
DATA_DIR = BASE_DIR.parent.parent / "data"

PIPELINE_PATH = ML_DIR / "ml_pipeline.pkl"
GRU_MODEL_PATH = ML_DIR / "model_gru.keras"
CACHE_PATH = ML_DIR / "recommendations_cache.pkl"

RAW_DATA_PATH = DATA_DIR / "raw" / "2020-Apr-L.csv"
ML_SCORES_PATH = DATA_DIR / "processed" / "ml_scores_hibrido.csv"

PESOS_EVENTO = {"view": 1, "cart": 2, "purchase": 3}
PESO_COLABORATIVO = 0.7
PESO_CONTENIDO = 0.3
LONGITUD_SECUENCIA = 10
EMBEDDING_DIM = 64
TOP_N_DEFAULT = 10
FALLBACK_TOP_N = 50
