import os

import pandas as pd
import psycopg2


DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5433")
DB_NAME = os.getenv("DB_NAME", "urbansoul_db")
DB_USER = os.getenv("DB_USER", "urbansoul")
DB_PASSWORD = os.getenv("DB_PASSWORD", "urbansoul")

INTERACTIONS_QUERY = """
    SELECT
        i.event_time,
        i.event_type,
        i.product_id,
        p.category_id,
        p.category_code,
        b.name AS brand,
        COALESCE(i.price, p.price) AS price,
        i.user_id,
        i.session_id AS user_session
    FROM interactions i
    JOIN products p ON i.product_id = p.id
    JOIN brands b ON p.brand_id = b.id
    WHERE i.user_id IS NOT NULL
"""


def get_connection():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
    )


def get_interactions_df() -> pd.DataFrame:
    conn = get_connection()
    try:
        df = pd.read_sql(INTERACTIONS_QUERY, conn, parse_dates=["event_time"])
        return df
    finally:
        conn.close()
