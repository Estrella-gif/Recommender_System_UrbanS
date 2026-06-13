# Sistema de Recomendación - UrbanS

Este repositorio contiene un sistema de recomendación enfocado en artículos de moda (ropa, zapatos, accesorios, etc.). El proyecto está estructurado en distintas fases de análisis y transformación de datos para preparar la información antes de aplicar los modelos de recomendación.

## Estructura del Proyecto

- `notebooks/limpieza.ipynb`: **Fase 2** - Limpieza de datos. Filtra las categorías correspondientes a moda, analiza valores duplicados y resume los eventos del dataset.
- `notebooks/procesamiento.ipynb`: **Fase 3** - Procesamiento de datos (Feature Engineering). Transforma los datos limpios en matrices dispersas (Filtrado Colaborativo) y vectores de características (Filtrado por Contenido) a través del cálculo de afinidad (recencia y frecuencia), One-Hot Encoding y normalización.
- `data/`: Directorio donde se almacenan los datasets crudos y los procesados (por ejemplo, `2020-Apr-L.csv`).
- `requirements.txt`: Archivo con el listado de todas las librerías necesarias para ejecutar el proyecto.

---

## Configuración del Entorno (Para otras laptops o nuevos usuarios)

Si clonaste este repositorio en una nueva computadora, tu entorno de Python local estará "limpio". Para que los notebooks funcionen correctamente sin que te salgan errores de `ModuleNotFoundError`, debes instalar las dependencias exactas del proyecto.

Sigue estos pasos desde tu terminal (consola):

1. **Clonar el repositorio y entrar a la carpeta del proyecto:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd Recommender_System_UrbanS
   ```

2. **Instalar todas las dependencias de un solo golpe:**
   Gracias al archivo `requirements.txt`, no necesitas instalar las librerías una por una. Solo debes ejecutar el siguiente comando:
   ```bash
   pip install -r requirements.txt
   ```
   *Esto instalará automáticamente `pandas`, `numpy`, `scipy`, `scikit-learn` y `jupyter`.*

3. **Ejecutar Jupyter Notebook:**
   ```bash
   jupyter notebook
   ```
   ¡Y listo! Ya puedes abrir y ejecutar todas las fases sin problemas de librerías faltantes.
