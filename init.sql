-- ============================================================================
-- UrbanS E-Commerce — Database Initialization
-- PostgreSQL 15+
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. CATEGORIES (hierarchical, up to 3 levels: apparel.shoes.slipons)
-- ============================================================================
CREATE TABLE categories (
    id           BIGSERIAL    PRIMARY KEY,
    parent_id    BIGINT       REFERENCES categories(id) ON DELETE SET NULL,
    name         VARCHAR(100) NOT NULL,
    slug         VARCHAR(150) NOT NULL UNIQUE,
    full_code    VARCHAR(255),          -- ej: "ropa.camisetas.manga_larga"
    level        INT          NOT NULL DEFAULT 0 CHECK (level BETWEEN 0 AND 2),
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. BRANDS
-- ============================================================================
CREATE TABLE brands (
    id           BIGSERIAL    PRIMARY KEY,
    name         VARCHAR(150) NOT NULL UNIQUE,
    slug         VARCHAR(150) NOT NULL UNIQUE,
    logo_url     VARCHAR(500),
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. PRODUCTS (your real catalog — FastAPI returns product_id from this table)
-- ============================================================================
CREATE TABLE products (
    id               BIGSERIAL      PRIMARY KEY,
    name             VARCHAR(300)   NOT NULL,
    description      TEXT,
    sku              VARCHAR(100)   UNIQUE,
    category_id      BIGINT         NOT NULL REFERENCES categories(id),
    brand_id         BIGINT         NOT NULL REFERENCES brands(id),
    category_code    VARCHAR(255),  -- ej: "ropa.camisetas" — semantic bridge for FastAPI content-based
    price            DECIMAL(10,2)  NOT NULL CHECK (price >= 0),
    compare_at_price DECIMAL(10,2)  CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
    stock_quantity   INT            NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    image_url        VARCHAR(500),
    is_active        BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. USERS (registered customers)
-- ============================================================================
CREATE TABLE users (
    id            BIGSERIAL    PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name    VARCHAR(100),
    last_name     VARCHAR(100),
    phone         VARCHAR(20),
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. USER SESSIONS (anonymous + authenticated tracking)
-- ============================================================================
CREATE TABLE user_sessions (
    id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      BIGINT       REFERENCES users(id) ON DELETE SET NULL,
    ip_address   INET,
    user_agent   TEXT,
    expires_at   TIMESTAMPTZ  NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. INTERACTIONS (view / cart / purchase — feeds the recommendation model)
-- ============================================================================
CREATE TABLE interactions (
    id           BIGSERIAL    PRIMARY KEY,
    user_id      BIGINT       REFERENCES users(id) ON DELETE SET NULL,
    session_id   UUID         NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
    product_id   BIGINT       NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    event_type   VARCHAR(20)  NOT NULL CHECK (event_type IN ('view', 'cart', 'purchase')),
    event_time   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    price        DECIMAL(10,2),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. ORDERS
-- ============================================================================
CREATE TABLE orders (
    id               BIGSERIAL      PRIMARY KEY,
    user_id          BIGINT         NOT NULL REFERENCES users(id),
    order_number     VARCHAR(50)    NOT NULL UNIQUE,
    status           VARCHAR(30)    NOT NULL DEFAULT 'pending'
                                    CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
    subtotal         DECIMAL(10,2)  NOT NULL CHECK (subtotal >= 0),
    shipping_cost    DECIMAL(10,2)  NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
    total            DECIMAL(10,2)  NOT NULL CHECK (total >= 0),
    shipping_address JSONB,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 8. ORDER ITEMS
-- ============================================================================
CREATE TABLE order_items (
    id           BIGSERIAL      PRIMARY KEY,
    order_id     BIGINT         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id   BIGINT         NOT NULL REFERENCES products(id),
    quantity     INT            NOT NULL CHECK (quantity > 0),
    unit_price   DECIMAL(10,2)  NOT NULL CHECK (unit_price >= 0),
    total_price  DECIMAL(10,2)  NOT NULL CHECK (total_price >= 0),
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- categories
CREATE INDEX idx_categories_parent    ON categories(parent_id);
CREATE INDEX idx_categories_full_code ON categories(full_code);
CREATE INDEX idx_categories_active    ON categories(is_active) WHERE is_active;

-- brands
CREATE INDEX idx_brands_active ON brands(is_active) WHERE is_active;

-- products
CREATE INDEX idx_products_category      ON products(category_id);
CREATE INDEX idx_products_brand         ON products(brand_id);
CREATE INDEX idx_products_category_code ON products(category_code);
CREATE INDEX idx_products_price         ON products(price);
CREATE INDEX idx_products_sku           ON products(sku);
CREATE INDEX idx_products_active        ON products(is_active) WHERE is_active;

-- users
CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_active   ON users(is_active) WHERE is_active;

-- user_sessions
CREATE INDEX idx_sessions_user      ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires   ON user_sessions(expires_at);

-- interactions (critical for recommendation model queries)
CREATE INDEX idx_interactions_user       ON interactions(user_id);
CREATE INDEX idx_interactions_product    ON interactions(product_id);
CREATE INDEX idx_interactions_session    ON interactions(session_id);
CREATE INDEX idx_interactions_event_type ON interactions(event_type);
CREATE INDEX idx_interactions_event_time ON interactions(event_time DESC);
-- composite index: backbone of user-product temporal queries for ML
CREATE INDEX idx_interactions_user_product_time
    ON interactions(user_id, product_id, event_time DESC);

-- orders
CREATE INDEX idx_orders_user    ON orders(user_id);
CREATE INDEX idx_orders_status  ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- order_items
CREATE INDEX idx_order_items_order   ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================================================
-- TRIGGER: auto-update updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON categories FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_brands_updated_at
    BEFORE UPDATE ON brands FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
