import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import numpy as np
import pandas as pd

from app.ml.preprocessing import (
    build_content_matrix,
    build_sparse_matrix,
    build_user_product_score,
    build_user_sequences,
)


def _make_sample_df() -> pd.DataFrame:
    return pd.DataFrame({
        "event_time": pd.to_datetime([
            "2020-04-01 10:00:00",
            "2020-04-01 11:00:00",
            "2020-04-02 09:00:00",
            "2020-04-02 10:00:00",
        ]),
        "event_type": ["view", "cart", "view", "purchase"],
        "product_id": [100, 200, 100, 300],
        "category_id": [10, 20, 10, 30],
        "category_code": ["a.bag", "a.shoe", "a.bag", "a.hat"],
        "brand": ["x", "y", "x", "z"],
        "price": [10.0, 20.0, 10.0, 30.0],
        "user_id": [1, 1, 2, 2],
        "user_session": ["s1", "s1", "s2", "s2"],
    })


def test_build_user_product_score():
    df = _make_sample_df()
    df_score = build_user_product_score(df)
    assert "score_norm" in df_score.columns
    assert df_score["score_norm"].max() <= 1.0
    assert df_score["score_norm"].min() >= 0.0
    assert len(df_score) == 4
    assert set(df_score["user_id"]) == {1, 2}


def test_build_sparse_matrix():
    df = _make_sample_df()
    df_score = build_user_product_score(df)
    matriz, user2idx, prod2idx, users, prods = build_sparse_matrix(df_score)
    assert matriz.shape == (2, 3)
    assert user2idx[1] == 0
    assert user2idx[2] == 1
    assert len(prods) == 3


def test_build_content_matrix():
    df = _make_sample_df()
    df_score = build_user_product_score(df)
    matriz, user2idx, prod2idx, users, prods = build_sparse_matrix(df_score)
    mat_cont, encoder, scaler, attrs, p2c = build_content_matrix(
        df, prod2idx, prods
    )
    assert mat_cont.shape[0] == 3
    assert mat_cont.shape[1] > 0
    assert len(attrs) == 3
    assert len(p2c) == 3


def test_build_user_sequences():
    df = _make_sample_df()
    user_to_index = {1: 0, 2: 1}
    product_to_index = {100: 0, 200: 1, 300: 2}
    seq = build_user_sequences(df, user_to_index, product_to_index)
    assert 0 in seq
    assert 1 in seq
    assert len(seq[0]) == 2
    assert len(seq[1]) == 2
