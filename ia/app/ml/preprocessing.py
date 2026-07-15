import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder

PESOS_EVENTO = {"view": 1, "cart": 2, "purchase": 3}
PESO_COLABORATIVO = 0.7
PESO_CONTENIDO = 0.3


def build_user_product_score(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["peso_evento"] = df["event_type"].map(PESOS_EVENTO)
    df_score = df.groupby(
        ["user_id", "product_id"], as_index=False
    ).agg(
        peso_total=("peso_evento", "sum"),
        frecuencia=("event_type", "count"),
        ultima_interaccion=("event_time", "max"),
    )
    fecha_referencia = df["event_time"].max()
    df_score["dias_desde_ultima_interaccion"] = (
        fecha_referencia - df_score["ultima_interaccion"]
    ).dt.days
    df_score["recencia"] = 1 / (1 + df_score["dias_desde_ultima_interaccion"])
    df_score["score"] = (
        df_score["peso_total"]
        * np.log1p(df_score["frecuencia"])
        * df_score["recencia"]
    )
    scaler = MinMaxScaler()
    df_score["score_norm"] = scaler.fit_transform(df_score[["score"]])
    return df_score


def build_sparse_matrix(
    df_score: pd.DataFrame,
) -> tuple[csr_matrix, dict, dict, np.ndarray, np.ndarray]:
    usuarios_unicos = df_score["user_id"].unique()
    productos_unicos = df_score["product_id"].unique()
    user_to_index = {uid: idx for idx, uid in enumerate(usuarios_unicos)}
    product_to_index = {pid: idx for idx, pid in enumerate(productos_unicos)}
    filas = df_score["user_id"].map(user_to_index).values
    columnas = df_score["product_id"].map(product_to_index).values
    valores = df_score["score_norm"].astype("float32").values
    matriz = csr_matrix(
        (valores, (filas, columnas)),
        shape=(len(usuarios_unicos), len(productos_unicos)),
    )
    return matriz, user_to_index, product_to_index, usuarios_unicos, productos_unicos


def build_content_matrix(
    df: pd.DataFrame,
    product_to_index: dict,
    productos_unicos: np.ndarray,
) -> tuple[csr_matrix, OneHotEncoder, MinMaxScaler, pd.DataFrame, dict]:
    atributos = df.groupby("product_id", as_index=False).agg(
        category_code=("category_code", "first"),
        brand=("brand", "first"),
        price=("price", "median"),
    )
    encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    matriz_categoria_marca = encoder.fit_transform(
        atributos[["category_code", "brand"]]
    )
    scaler = MinMaxScaler()
    precio_norm = scaler.fit_transform(atributos[["price"]])
    from scipy.sparse import hstack
    matriz_contenido = hstack(
        [csr_matrix(matriz_categoria_marca), csr_matrix(precio_norm)],
        format="csr",
    )
    productos_contenido = atributos["product_id"].values
    producto_a_idx_contenido = {
        pid: idx for idx, pid in enumerate(productos_contenido)
    }
    return (
        matriz_contenido,
        encoder,
        scaler,
        atributos,
        producto_a_idx_contenido,
    )


def crear_perfil_contenido_usuario(
    user_id: int,
    df_score: pd.DataFrame,
    matriz_contenido_producto: csr_matrix,
    producto_a_idx_contenido: dict,
) -> tuple[csr_matrix, np.ndarray]:
    historial = df_score[df_score["user_id"] == user_id][
        ["product_id", "score_norm"]
    ]
    historial = historial[
        historial["product_id"].isin(producto_a_idx_contenido)
    ]
    if historial.empty:
        return csr_matrix((1, matriz_contenido_producto.shape[1])), np.array([])
    indices_historial = (
        historial["product_id"]
        .map(producto_a_idx_contenido)
        .astype(int)
        .values
    )
    pesos = historial["score_norm"].values.reshape(-1, 1)
    perfil = matriz_contenido_producto[indices_historial].multiply(pesos).sum(axis=0)
    return csr_matrix(perfil), indices_historial


def build_user_sequences(
    df: pd.DataFrame,
    user_to_index: dict,
    product_to_index: dict,
    longitud_secuencia: int = 10,
) -> dict:
    df = df.sort_values("event_time")
    df["user_idx"] = df["user_id"].map(user_to_index)
    df["product_idx"] = df["product_id"].map(product_to_index)
    df = df.dropna(subset=["user_idx", "product_idx"])
    df["user_idx"] = df["user_idx"].astype(int)
    df["product_idx"] = df["product_idx"].astype(int)
    historial = (
        df.groupby("user_idx")["product_idx"].apply(list).to_dict()
    )
    return historial
