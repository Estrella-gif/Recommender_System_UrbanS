# Sistema de Recomendacion - UrbanS

Sistema de recomendacion de articulos de moda (ropa, zapatos, accesorios, etc.).

## Estructura del Proyecto

```
Recommender_System_UrbanS/
├── jupyter/                  # Fase exploratoria y modelado
│   ├── requirements.txt
│   ├── notebooks/
│   │   ├── eda/              # Analisis exploratorio de datos
│   │   │   └── outputs/      # Graficos generados
│   │   ├── procesamiento/    # Limpieza, feature engineering y evaluacion
│   │   └── modelos/          # ML y Deep Learning
│   └── data/
│       ├── raw/              # Datasets originales y limpios
│       └── processed/        # Salidas de modelos (scores, predicciones)
├── backend/                  # (proximamente)
├── frontend/                 # (proximamente)
└── ia/                       # Servicio FastAPI (proximamente)
```

## Configuracion del Entorno (Jupyter)

```bash
cd jupyter
pip install -r requirements.txt
jupyter notebook
```
