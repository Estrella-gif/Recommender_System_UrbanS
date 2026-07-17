# Sistema de Recomendacion — UrbanS

Sistema de recomendacion de articulos de moda (ropa, zapatos, accesorios, etc.) con backend Spring Boot, modelo de IA con FastAPI y base de datos PostgreSQL.

## Arranque rapido

```bash
docker compose up -d --build
```

Esto levanta los 5 servicios en orden (PostgreSQL → FastAPI + Backend → Frontend Angular + Dashboard Métricas):

| Servicio | Puerto | Descripcion |
|----------|:---:|-------------|
| PostgreSQL | `5433` | Base de datos con `init.sql` y `seed.sql` auto-ejecutados |
| FastAPI | `8000` | Servicio IA de recomendaciones + métricas |
| Spring Boot | `8080` | Backend REST API del e-commerce |
| Angular Metrics | `4200` | Dashboard de métricas de modelos IA en tiempo real |
| Angular E-commerce | `4201` | Tienda UrbanSoul — catálogo, carrito, órdenes |

Al primer `docker compose up`:

1. PostgreSQL se levanta y ejecuta `init.sql` (schema) + `seed.sql` (datos de prueba)
2. FastAPI y Backend esperan a que PostgreSQL esté healthy
3. Los frontend Angular levantan sus dev servers con hot reload

La BD persiste en el volumen `urbansoul_postgres_data`. Para recrearla desde cero:

```bash
docker compose down -v && docker compose up -d --build
```

## Estructura del Proyecto

```
Recommender_System_UrbanS/
├── docker-compose.yml         # 5 servicios orquestados
├── init.sql                   # Esquema PostgreSQL para el e-commerce
├── seed.sql                   # Datos de prueba (50 productos, 5 usuarios)
├── data/
│   ├── raw/                   # Datasets (2020-Apr.csv, 2020-Apr-L.csv)
│   └── processed/             # Salidas de modelos (scores, predicciones)
├── jupyter/                   # Fase exploratoria y modelado
│   ├── requirements.txt
│   └── notebooks/
│       ├── eda/               # Analisis exploratorio de datos
│       │   └── outputs/       # Graficos generados
│       ├── procesamiento/     # Limpieza, feature engineering y evaluacion
│       └── modelos/           # ML y Deep Learning
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
├── backend/                   # Spring Boot 3.4 — REST API
│   ├── .env-example
│   ├── build.gradle
│   └── src/main/java/com/urbansoul/backend/
│       ├── config/            # Security, CORS
│       ├── controller/        # Auth, Product, Recommendation, Order
│       ├── dto/               # Requests y responses (records)
│       ├── entity/            # JPA entities (8 tablas)
│       ├── enums/             # EventType, OrderStatus
│       ├── exception/         # GlobalExceptionHandler
│       ├── repository/        # Spring Data JPA repos
│       ├── security/          # JWT provider + filter
│       └── service/           # Logica de negocio
└── frontend/                  # Next.js (proximamente)
```

---

## Gestion de Datos

Los datasets **NO** se versionan en Git (estan en `.gitignore`). Todos los componentes del proyecto (notebooks, batch job, IA) leen desde `data/` en la raiz.

### Archivos requeridos

| Archivo | Origen | Ubicacion |
|---------|--------|-----------|
| `2020-Apr.csv` | Dataset original (66.5M filas) | `data/raw/2020-Apr.csv` |
| `2020-Apr-L.csv` | Dataset limpio (~9.6M filas, solo moda) | `data/raw/2020-Apr-L.csv` |

### Paso a paso

```bash
# 1. Crear las carpetas
mkdir -p data/raw
mkdir -p data/processed

# 2. Copiar el dataset original
cp /ruta/de/descarga/2020-Apr.csv data/raw/

# 3. Ejecutar el notebook de limpieza (genera 2020-Apr-L.csv en data/raw/)
cd jupyter
pip install -r requirements.txt
jupyter notebook notebooks/procesamiento/limpieza.ipynb

# 4. (Alternativa) Si ya tienes el dataset limpio, copialo directo
cp /ruta/de/descarga/2020-Apr-L.csv data/raw/
```

> Los notebooks de `jupyter/` leen con rutas relativas `../../data/raw/` que apuntan a `data/raw/` en raiz.  
> El `batch_job.py` usa `config.py` que ya apunta a `data/` en raiz. Ambos leen del mismo lugar.

---

## Base de Datos (PostgreSQL)

Levanta PostgreSQL con Docker Compose:

```bash
docker compose up -d
```

- **Host**: `localhost:5433` (puerto no default para no interferir con PostgreSQL local)
- **BD**: `urbansoul_db`
- **Usuario**: `urbansoul`
- **Password**: `urbansoul`

El `init.sql` se ejecuta automaticamente solo la primera vez que se crea el volumen. Si ya tienes datos, no se vuelve a ejecutar.

Para conectarte manualmente:

```bash
psql -h localhost -p 5433 -U urbansoul -d urbansoul_db
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

### Usuarios de prueba (seed)

| Email | Password |
|-------|----------|
| `maria.garcia@email.com` | `admin123` |
| `carlos.lopez@email.com` | `admin123` |
| `ana.martinez@email.com` | `admin123` |
| `diego.rodriguez@email.com` | `admin123` |
| `lucia.fernandez@email.com` | `admin123` |

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

### Backend — Spring Boot

```bash
cd backend

# 1. Copiar variables de entorno
cp .env-example .env
# Editar .env con valores reales (especialmente JWT_SECRET)

# 2. Compilar y ejecutar
./gradlew bootRun
```

Endpoints:
- `GET /api/products` — catalogo con busqueda y filtros
- `GET /api/products/popular` — productos mas populares
- `POST /api/auth/register` — registro
- `POST /api/auth/login` — login (retorna JWT)
- `GET /api/recommendations` — recomendaciones personalizadas (JWT requerido)
- `GET /api/recommendations/popular` — recomendaciones populares (anonimo)
- `POST /api/orders` — crear orden (JWT requerido)
- `GET /api/orders` — listar ordenes del usuario (JWT requerido)
- `GET /swagger` — Swagger UI
