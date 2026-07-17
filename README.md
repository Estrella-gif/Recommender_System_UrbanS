# Sistema de Recomendacion — UrbanS

Sistema de recomendacion de articulos de moda (ropa, zapatos, accesorios, etc.) con backend Spring Boot, modelo de IA con FastAPI y base de datos PostgreSQL.

## Estructura del Proyecto

```
Recommender_System_UrbanS/
├── init.sql                   # Esquema PostgreSQL para el e-commerce
├── data/
│   └── raw/                   # Datasets originales (NO se versionan, ver .gitignore)
├── jupyter/                   # Fase exploratoria y modelado
│   ├── requirements.txt
│   ├── notebooks/
│   │   ├── eda/               # Analisis exploratorio de datos
│   │   │   └── outputs/       # Graficos generados
│   │   ├── procesamiento/     # Limpieza, feature engineering y evaluacion
│   │   └── modelos/           # ML y Deep Learning
│   └── data/
│       ├── raw/               # Copia del dataset limpio para la IA
│       └── processed/         # Salidas de modelos (scores, predicciones)
├── ia/                        # Servicio FastAPI de recomendacion
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py            # Entry point (uvicorn)
│   │   ├── api/routes.py      # GET /recommendations/{user_id}
│   │   ├── core/config.py     # Paths, pesos, hiperparametros
│   │   ├── core/model_loader.py
│   │   ├── ml/batch_job.py    # Pipeline offline: entrena + infiere + cachea
│   │   ├── ml/preprocessing.py
│   │   ├── models/schemas.py  # Pydantic: RecommendationItem, RecommendationResponse
│   │   └── services/recommender.py
│   └── tests/
├── backend/                   # Spring Boot (proximamente)
└── frontend/                  # Next.js (proximamente)
```

---

## Gestion de Datos

Los datasets **NO** se versionan en Git (estan en `.gitignore`). Cada persona debe ubicarlos manualmente.

### Archivos requeridos

| Archivo | Origen | Donde colocarlo |
|---------|--------|-----------------|
| `2020-Apr.csv` | Dataset original (66.5M filas) | `data/raw/2020-Apr.csv` |
| `2020-Apr-L.csv` | Dataset limpio (~9.6M filas, solo moda) | `jupyter/data/raw/2020-Apr-L.csv` |

### Paso a paso

```bash
# 1. Crear las carpetas necesarias
mkdir -p data/raw
mkdir -p jupyter/data/raw
mkdir -p jupyter/data/processed

# 2. Copiar el dataset original a data/raw/
cp /ruta/de/descarga/2020-Apr.csv data/raw/

# 3. Ejecutar el notebook de limpieza (genera 2020-Apr-L.csv en jupyter/data/raw/)
cd jupyter
pip install -r requirements.txt
jupyter notebook notebooks/procesamiento/limpieza.ipynb

# 4. (Opcional) Si ya tienes el dataset limpio, copialo directamente
cp /ruta/de/descarga/2020-Apr-L.csv jupyter/data/raw/
```

> **Nota para el servicio IA**: `batch_job.py` lee `jupyter/data/raw/2020-Apr-L.csv` via `config.py`.  
> Las notebooks de `jupyter/notebooks/modelos/` leen desde `../../data/raw/2020-Apr-L.csv` (ruta relativa a `data/raw/` raiz). Si ejecutas los notebooks, asegurate de tener el CSV en ambas ubicaciones o ajusta los paths.

---

## Base de Datos (PostgreSQL)

El archivo `init.sql` contiene el esquema completo del e-commerce. Ejecutalo contra una instancia de PostgreSQL 15+:

```bash
psql -h localhost -U postgres -d urbans -f init.sql
```

### Tablas

| Tabla | Descripcion |
|-------|-------------|
| `categories` | Jerarquia de categorias (3 niveles, autoreferenciado con `parent_id`) |
| `brands` | Marcas del catalogo |
| `products` | Catalogo real de productos (con `category_code` como puente semantico hacia FastAPI) |
| `users` | Clientes registrados |
| `user_sessions` | Sesiones anonimas (UUID) — tracking pre-login sin perder interacciones |
| `interactions` | Eventos `view` / `cart` / `purchase` — **alimenta el modelo de recomendacion** |
| `orders` | Ordenes de compra |
| `order_items` | Lineas de cada orden |

### Flujo de recomendacion

```
interactions (PostgreSQL)
    │
    └──> FastAPI (entrena / infiere)
              │
              └──> devuelve product_id, score, category_code, brand, price
                        │
                        └──> Spring Boot ──> Frontend
```

El modelo lee `interactions` para generar recomendaciones basadas en comportamiento real de usuarios. Los `product_id` devueltos existen en la tabla `products`.

---

## Configuracion del Entorno

### Jupyter (exploracion y modelado)

```bash
cd jupyter
pip install -r requirements.txt
jupyter notebook
```

### IA — Servicio FastAPI

```bash
cd ia
pip install -r requirements.txt

# 1. Ejecutar el pipeline offline (genera modelos y cache)
python -m app.ml.batch_job

# 2. Levantar la API
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Endpoints:
- `GET /recommendations/{user_id}?top_n=10` → recomendaciones cacheadas
- `GET /docs` → Swagger UI

### IA — Docker

```bash
cd ia
docker build -t urbans-ia .
docker run -p 8000:8000 -v $(pwd)/app/ml:/app/app/ml urbans-ia
```

> El volumen `-v` monta la carpeta `ml/` con los archivos `.pkl` y `.keras` generados por `batch_job.py`.
