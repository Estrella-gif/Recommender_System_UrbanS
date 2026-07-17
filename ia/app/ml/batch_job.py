"""
Offline batch job that runs the full ML + DL recommendation pipeline
for all users and caches the results to disk.

Usage:
    python -m app.ml.batch_job                  # full run (train + infer)
    python -m app.ml.batch_job --skip-train      # skip GRU training
    python -m app.ml.batch_job --num-users 500   # subset for testing
"""

import argparse
import json
import pickle
import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from app.core.config import (
    CACHE_PATH,
    EMBEDDING_DIM,
    GRU_MODEL_PATH,
    LONGITUD_SECUENCIA,
    ML_SCORES_PATH,
    PESOS_EVENTO,
    PIPELINE_PATH,
    RAW_DATA_PATH,
    TOP_N_DEFAULT,
)
from app.ml.preprocessing import (
    build_content_matrix,
    build_sparse_matrix,
    build_user_product_score,
    build_user_sequences,
    crear_perfil_contenido_usuario,
)


def load_data() -> pd.DataFrame:
    df = pd.read_csv(RAW_DATA_PATH, parse_dates=["event_time"])
    return df


def build_ml_pipeline(df: pd.DataFrame) -> dict:
    df_score = build_user_product_score(df)
    (
        matriz_usuario_producto,
        user_to_index,
        product_to_index,
        usuarios_unicos,
        productos_unicos,
    ) = build_sparse_matrix(df_score)
    (
        matriz_contenido_producto,
        _encoder_contenido,
        _scaler_contenido,
        atributos_producto,
        producto_a_idx_contenido,
    ) = build_content_matrix(df, product_to_index, productos_unicos)

    from sklearn.neighbors import NearestNeighbors
    modelo_knn = NearestNeighbors(metric="cosine", algorithm="brute", n_neighbors=6)
    modelo_knn.fit(matriz_usuario_producto)

    pipeline = {
        "df_score": df_score,
        "modelo_knn": modelo_knn,
        "matriz_usuario_producto": matriz_usuario_producto,
        "matriz_contenido_producto": matriz_contenido_producto,
        "user_to_index": user_to_index,
        "product_to_index": product_to_index,
        "usuarios_unicos": usuarios_unicos,
        "productos_unicos": productos_unicos,
        "producto_a_idx_contenido": producto_a_idx_contenido,
        "atributos_producto": atributos_producto,
        "index_to_user": {v: k for k, v in user_to_index.items()},
        "index_to_product": {v: k for k, v in product_to_index.items()},
        "pesos_evento": PESOS_EVENTO,
    }
    return pipeline


def build_gru_model(num_productos: int, num_usuarios: int):
    import os
    os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

    from tensorflow.keras.layers import (
        Concatenate,
        Dense,
        Dropout,
        Embedding,
        Flatten,
        GRU,
        Input,
    )
    from tensorflow.keras.models import Model

    input_secuencia = Input(
        shape=(LONGITUD_SECUENCIA,), name="secuencia_productos"
    )
    input_usuario = Input(shape=(1,), name="usuario_id")
    input_candidato = Input(shape=(1,), name="producto_candidato")
    input_ml_score = Input(shape=(1,), name="ml_score")

    emb_producto_layer = Embedding(
        input_dim=num_productos,
        output_dim=EMBEDDING_DIM,
        name="emb_producto",
    )
    emb_usuario_layer = Embedding(
        input_dim=num_usuarios,
        output_dim=EMBEDDING_DIM,
        name="emb_usuario",
    )

    emb_secuencia = emb_producto_layer(input_secuencia)
    emb_usuario = Flatten()(emb_usuario_layer(input_usuario))
    emb_candidato = Flatten()(emb_producto_layer(input_candidato))
    vector_dl = GRU(units=64, name="Capa_GRU")(emb_secuencia)

    caracteristicas = Concatenate(name="fusion_caracteristicas")(
        [vector_dl, emb_usuario, emb_candidato, input_ml_score]
    )

    x = Dense(128, activation="relu")(caracteristicas)
    x = Dropout(0.2)(x)
    x = Dense(64, activation="relu")(x)
    output_score = Dense(1, activation="sigmoid", name="score_final")(x)

    model = Model(
        inputs=[
            input_secuencia,
            input_usuario,
            input_candidato,
            input_ml_score,
        ],
        outputs=output_score,
        name="UrbanSoul_Hybrid_GRU",
    )
    return model


def _preparar_datos_entrenamiento_gru(
    df: pd.DataFrame,
    pipeline: dict,
) -> tuple:
    from keras.utils import pad_sequences
    from sklearn.model_selection import train_test_split

    df_scores_hibrido = pd.read_csv(ML_SCORES_PATH)
    user_to_index = pipeline["user_to_index"]
    product_to_index = pipeline["product_to_index"]
    historial_usuarios = build_user_sequences(
        df, user_to_index, product_to_index, LONGITUD_SECUENCIA
    )

    df_scores_hibrido["user_idx"] = (
        df_scores_hibrido["user_id"].map(user_to_index)
    )
    df_scores_hibrido["product_idx"] = (
        df_scores_hibrido["product_id"].map(product_to_index)
    )
    df_scores = df_scores_hibrido.dropna(subset=["user_idx", "product_idx"])

    X_secuencias_list = []
    X_usuarios_list = []
    X_candidatos_list = []
    X_ml_scores_list = []
    y_targets_list = []

    for _, row in df_scores.iterrows():
        uid = int(row["user_idx"])
        candidato_id = int(row["product_idx"])
        ml_score = float(row["score_ml_refinado"])
        
        # ¡Mantén esta solución para evitar el error!
        target = int(row.get("target", 1)) 
        
        historial = historial_usuarios.get(uid, [])
        historial_filtrado = [p for p in historial if p != candidato_id]
        X_usuarios_list.append(uid)
        X_candidatos_list.append(candidato_id)
        X_ml_scores_list.append(ml_score)
        X_secuencias_list.append(historial_filtrado[-LONGITUD_SECUENCIA:])
        y_targets_list.append(target)

    X_secuencias = pad_sequences(
        X_secuencias_list, maxlen=LONGITUD_SECUENCIA, padding="pre"
    )
    X_usuarios = np.array(X_usuarios_list)
    X_candidatos = np.array(X_candidatos_list)
    X_ml_scores = np.array(X_ml_scores_list)
    y = np.array(y_targets_list)

    usuarios_unicos_idx = np.unique(X_usuarios)
    train_users, val_users = train_test_split(
        usuarios_unicos_idx, test_size=0.2, random_state=42
    )
    train_mask = np.isin(X_usuarios, train_users)
    val_mask = np.isin(X_usuarios, val_users)
    return (
        X_secuencias[train_mask],
        X_usuarios[train_mask],
        X_candidatos[train_mask],
        X_ml_scores[train_mask],
        y[train_mask],
        X_secuencias[val_mask],
        X_usuarios[val_mask],
        X_candidatos[val_mask],
        X_ml_scores[val_mask],
        y[val_mask],
    )


def train_gru_model(df: pd.DataFrame, pipeline: dict):
    num_productos = len(pipeline["productos_unicos"])
    num_usuarios = len(pipeline["usuarios_unicos"])
    model = build_gru_model(num_productos, num_usuarios)
    model.compile(
        optimizer="adam",
        loss="binary_crossentropy",
        metrics=["accuracy"],
    )
    (
        X_seq_tr, X_usr_tr, X_can_tr, X_ml_tr, y_tr,
        X_seq_vl, X_usr_vl, X_can_vl, X_ml_vl, y_vl,
    ) = _preparar_datos_entrenamiento_gru(df, pipeline)
    model.fit(
        x=[X_seq_tr, X_usr_tr, X_can_tr, X_ml_tr],
        y=y_tr,
        validation_data=(
            [X_seq_vl, X_usr_vl, X_can_vl, X_ml_vl],
            y_vl,
        ),
        epochs=5,
        batch_size=256,
        verbose=1,
    )
    model.save(GRU_MODEL_PATH)
    print(f"GRU model saved to {GRU_MODEL_PATH}")
    return model


def load_gru_model():
    import os
    os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
    from tensorflow.keras.models import load_model
    return load_model(GRU_MODEL_PATH)


def compute_ml_score_for_user(
    user_id: int,
    pipeline: dict,
    top_n: int = 50,
) -> pd.DataFrame:
    user_to_index = pipeline["user_to_index"]
    usuarios_unicos = pipeline["usuarios_unicos"]
    productos_unicos = pipeline["productos_unicos"]
    producto_a_idx_contenido = pipeline["producto_a_idx_contenido"]
    matriz_usuario_producto = pipeline["matriz_usuario_producto"]
    matriz_contenido_producto = pipeline["matriz_contenido_producto"]
    df_score = pipeline["df_score"]
    modelo_knn = pipeline["modelo_knn"]
    atributos_producto = pipeline["atributos_producto"]

    user_idx = user_to_index[user_id]

    # --- colaborativo ---
    distancias, indices = modelo_knn.kneighbors(
        matriz_usuario_producto[user_idx], n_neighbors=6
    )
    vecinos_idx = indices.flatten()[1:]
    similitudes = 1 - distancias.flatten()[1:]
    productos_usuario = set(
        df_score[df_score["user_id"] == user_id]["product_id"]
    )
    candidatos_cf = []
    for vecino_idx, similitud in zip(vecinos_idx, similitudes):
        vecino_id = usuarios_unicos[vecino_idx]
        prod_vecino = df_score[df_score["user_id"] == vecino_id].copy()
        prod_vecino = prod_vecino[~prod_vecino["product_id"].isin(productos_usuario)]
        prod_vecino["score_colaborativo"] = prod_vecino["score_norm"] * similitud
        candidatos_cf.append(prod_vecino[["product_id", "score_colaborativo"]])
    if not candidatos_cf:
        return pd.DataFrame(
            columns=["product_id", "score_ml_refinado", "category_code", "brand", "price"]
        )
    recomendaciones_cf = pd.concat(candidatos_cf)
    recomendaciones_cf = (
        recomendaciones_cf.groupby("product_id", as_index=False)["score_colaborativo"]
        .sum()
        .sort_values("score_colaborativo", ascending=False)
        .head(top_n)
    )

    # --- contenido ---
    perfil_usuario, indices_historial = crear_perfil_contenido_usuario(
        user_id, df_score, matriz_contenido_producto, producto_a_idx_contenido
    )
    from sklearn.metrics.pairwise import cosine_similarity
    productos_contenido = atributos_producto["product_id"].values
    if perfil_usuario.nnz == 0:
        return recomendaciones_cf.merge(
            atributos_producto[["product_id", "category_code", "brand", "price"]],
            on="product_id", how="left"
        ).assign(score_ml_refinado=lambda d: d["score_colaborativo"])

    similitudes_cb = cosine_similarity(
        perfil_usuario, matriz_contenido_producto
    ).ravel()
    similitudes_cb[indices_historial.astype(int)] = -1
    top_indices = np.argsort(similitudes_cb)[::-1][:top_n]
    recomendaciones_cb = pd.DataFrame({
        "product_id": productos_contenido[top_indices],
        "score_contenido": similitudes_cb[top_indices],
    })

    # --- fusión híbrida ---
    rec_cf_det = recomendaciones_cf.merge(
        atributos_producto[["product_id", "category_code", "brand", "price"]],
        on="product_id", how="left"
    )
    candidatos = pd.concat([
        rec_cf_det[["product_id", "score_colaborativo"]],
        recomendaciones_cb[["product_id"]].assign(score_colaborativo=0),
    ], ignore_index=True).drop_duplicates("product_id")

    candidatos = candidatos[
        candidatos["product_id"].isin(producto_a_idx_contenido)
    ].copy()
    indices_cand = (
        candidatos["product_id"].map(producto_a_idx_contenido).astype(int).values
    )
    candidatos["score_contenido"] = cosine_similarity(
        perfil_usuario, matriz_contenido_producto[indices_cand]
    ).ravel()

    from sklearn.preprocessing import MinMaxScaler
    scaler_cf = MinMaxScaler()
    scaler_cb = MinMaxScaler()
    candidatos["score_colaborativo_norm"] = scaler_cf.fit_transform(
        candidatos[["score_colaborativo"]]
    )
    candidatos["score_contenido_norm"] = scaler_cb.fit_transform(
        candidatos[["score_contenido"]]
    )
    candidatos["score_ml_refinado"] = (
        0.7 * candidatos["score_colaborativo_norm"]
        + 0.3 * candidatos["score_contenido_norm"]
    )
    candidatos = candidatos.merge(
        atributos_producto[["product_id", "category_code", "brand", "price"]],
        on="product_id", how="left"
    ).sort_values("score_ml_refinado", ascending=False).head(top_n)

    return candidatos


def run_inference(
    df: pd.DataFrame,
    pipeline: dict,
    gru_model,
    user_ids: list[int] | None = None,
    top_n: int = TOP_N_DEFAULT,
) -> dict:
    user_to_index = pipeline["user_to_index"]
    product_to_index = pipeline["product_to_index"]
    historial_usuarios = build_user_sequences(
        df, user_to_index, product_to_index, LONGITUD_SECUENCIA
    )

    if user_ids is None:
        user_ids = list(pipeline["usuarios_unicos"])

    cache = {}
    total = len(user_ids)
    for i, user_id in enumerate(user_ids):
        if i % 100 == 0:
            print(f"Inference progress: {i}/{total} users")

        user_idx = user_to_index.get(user_id)
        if user_idx is None:
            continue

        candidatos_ml = compute_ml_score_for_user(user_id, pipeline, top_n=top_n)
        if candidatos_ml.empty:
            continue

        historial = historial_usuarios.get(user_idx, [])
        secuencias = []
        usuarios_t = []
        candidatos_t = []
        ml_scores = []

        for _, row in candidatos_ml.iterrows():
            cand_pid = int(row["product_id"])
            cand_idx = product_to_index.get(cand_pid)
            if cand_idx is None:
                continue
            hist_filt = [p for p in historial if p != cand_idx]
            sec = hist_filt[-LONGITUD_SECUENCIA:]
            secuencias.append(sec)
            usuarios_t.append(user_idx)
            candidatos_t.append(cand_idx)
            ml_scores.append(float(row["score_ml_refinado"]))

        if not secuencias:
            continue

        from keras.utils import pad_sequences
        X_seq = pad_sequences(secuencias, maxlen=LONGITUD_SECUENCIA, padding="pre")
        X_usr = np.array(usuarios_t, dtype=np.int32)
        X_can = np.array(candidatos_t, dtype=np.int32)
        X_ml = np.array(ml_scores, dtype=np.float32)

        scores = gru_model.predict(
            [X_seq, X_usr, X_can, X_ml], verbose=0
        ).ravel()

        result_df = candidatos_ml.iloc[: len(scores)].copy()
        result_df["score_final"] = scores
        result_df = result_df.sort_values("score_final", ascending=False).head(top_n)

        producto_a_attrs = pipeline["atributos_producto"].set_index("product_id")
        recs = []
        for _, r in result_df.iterrows():
            pid = int(r["product_id"])
            attrs = producto_a_attrs.loc[pid] if pid in producto_a_attrs.index else None
            recs.append({
                "product_id": pid,
                "score": round(float(r["score_final"]), 6),
                "category_code": str(attrs["category_code"]) if attrs is not None else None,
                "brand": str(attrs["brand"]) if attrs is not None else None,
                "price": float(attrs["price"]) if attrs is not None else None,
            })
        cache[int(user_id)] = recs

    print(f"Inference done. {len(cache)} users cached.")
    return cache


def compute_popular_items(pipeline: dict, top_n: int = 50) -> list[dict]:
    df_score = pipeline["df_score"]
    atributos_producto = pipeline["atributos_producto"]
    populares = (
        df_score.groupby("product_id")
        .size()
        .sort_values(ascending=False)
        .head(top_n)
        .index
    )
    producto_a_attrs = atributos_producto.set_index("product_id")
    recs = []
    for pid in populares:
        attrs = producto_a_attrs.loc[pid] if pid in producto_a_attrs.index else None
        recs.append({
            "product_id": int(pid),
            "score": 0.0,
            "category_code": str(attrs["category_code"]) if attrs is not None else None,
            "brand": str(attrs["brand"]) if attrs is not None else None,
            "price": float(attrs["price"]) if attrs is not None else None,
        })
    return recs


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-train", action="store_true")
    parser.add_argument("--num-users", type=int, default=None)
    args = parser.parse_args()

    print("Loading data...")
    df = load_data()

    print("Building ML pipeline...")
    pipeline = build_ml_pipeline(df)
    print(f"  Users: {len(pipeline['usuarios_unicos'])}")
    print(f"  Products: {len(pipeline['productos_unicos'])}")

    with open(PIPELINE_PATH, "wb") as f:
        pickle.dump(pipeline, f)
    print(f"ML pipeline saved to {PIPELINE_PATH}")

    if GRU_MODEL_PATH.exists() and args.skip_train:
        print("Loading existing GRU model...")
        gru_model = load_gru_model()
    elif GRU_MODEL_PATH.exists():
        print("GRU model already exists. Use --skip-train to skip training.")
    else:
        print("Training GRU model...")
        gru_model = train_gru_model(df, pipeline)

    if not GRU_MODEL_PATH.exists():
        print("No GRU model available. Run without --skip-train first.")
        return

    gru_model = load_gru_model()

    user_ids = list(pipeline["usuarios_unicos"])
    if args.num_users:
        user_ids = user_ids[: args.num_users]

    print(f"Running inference for {len(user_ids)} users...")
    cache = run_inference(df, pipeline, gru_model, user_ids=user_ids)

    popular = compute_popular_items(pipeline)
    cache_payload = {
        "recommendations": cache,
        "popular_items": popular,
    }

    with open(CACHE_PATH, "wb") as f:
        pickle.dump(cache_payload, f)
    print(f"Cache saved to {CACHE_PATH} ({len(cache)} users + fallback)")


if __name__ == "__main__":
    main()
