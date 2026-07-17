# UrbanSoul Backend — API Contract

**Base URL:** `http://localhost:8080`

## Authentication

| Header | Value |
|--------|-------|
| `Authorization` | `Bearer <JWT_TOKEN>` |

JWT expires after 24 hours. Tokens are obtained via `/api/auth/login` or `/api/auth/register`.

---

## Endpoints

### 1. Register

```
POST /api/auth/register
```

**Auth:** Public

**Request Body:**

| Field | Type | Validation | Required |
|-------|------|-----------|:---:|
| `email` | string | `@Email` | Yes |
| `password` | string | `@Size(min = 8)` | Yes |
| `firstName` | string | — | No |
| `lastName` | string | — | No |
| `phone` | string | — | No |

**Response:** `201 Created`

```json
{
  "token": "eyJhbGci...",
  "userId": 1,
  "email": "user@example.com"
}
```

---

### 2. Login

```
POST /api/auth/login
```

**Auth:** Public

**Request Body:**

| Field | Type | Validation | Required |
|-------|------|-----------|:---:|
| `email` | string | `@NotBlank @Email` | Yes |
| `password` | string | `@NotBlank` | Yes |

**Response:** `200 OK` → same `AuthResponse` as Register

---

### 3. Search Products

```
GET /api/products
```

**Auth:** Public

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `q` | string | — | Free-text search (matches name) |
| `category` | string | — | Filter by category slug |
| `brand` | string | — | Filter by brand slug |
| `page` | int | 0 | Page number (0-indexed) |
| `size` | int | 20 | Page size |

**Response:** `200 OK`

```json
{
  "content": [
    {
      "id": 1,
      "name": "Classic Hoodie",
      "description": "Premium cotton hoodie...",
      "sku": "HD-001",
      "categoryCode": "apparel.hoodies",
      "categoryId": 5,
      "categoryName": "Hoodies",
      "brand": "UrbanSoul",
      "brandId": 1,
      "price": 89.99,
      "compareAtPrice": 120.00,
      "stockQuantity": 45,
      "imageUrl": "https://..."
    }
  ],
  "totalElements": 150,
  "totalPages": 8,
  "number": 0,
  "size": 20,
  "first": true,
  "last": false
}
```

---

### 4. Get Product by ID

```
GET /api/products/{id}
```

**Auth:** Public

**Response:** `200 OK` → `ProductResponse`

---

### 5. Personalized Recommendations

```
GET /api/recommendations
```

**Auth:** JWT required

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `topN` | int | 10 | Number of recommendations |

**Response:** `200 OK`

```json
[
  {
    "productId": 42,
    "name": "Slim Fit Jeans",
    "categoryCode": "apparel.jeans",
    "brand": "UrbanSoul",
    "price": 79.99,
    "imageUrl": "https://...",
    "score": 0.95
  }
]
```

If FastAPI is unreachable or no recommendations exist → falls back to popular items (same structure, `score: 0.0`).

---

### 6. Popular Products

```
GET /api/recommendations/popular
```

**Auth:** Public

**Query Parameters:**

| Param | Type | Default |
|-------|------|---------|
| `topN` | int | 10 |

**Response:** `200 OK` → same `List<RecommendationResponse>` as #5

---

### 7. Create Order

```
POST /api/orders
```

**Auth:** JWT required

**Request Body:**

```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}
```

| Field | Type | Validation |
|-------|------|-----------|
| `items` | array | `@NotEmpty` |
| `items[].productId` | number | `@NotNull` |
| `items[].quantity` | number | `@Min(1)` |

**Response:** `201 Created`

```json
{
  "id": 100,
  "orderNumber": "A3F2B9C1D4E5",
  "status": "pending",
  "subtotal": 179.98,
  "shippingCost": 0.00,
  "total": 179.98,
  "shippingAddress": null,
  "createdAt": "2026-07-17T14:30:00Z",
  "updatedAt": "2026-07-17T14:30:00Z",
  "items": [
    {
      "id": 201,
      "product": { "id": 1, "name": "...", "price": 89.99, ... },
      "quantity": 2,
      "unitPrice": 89.99,
      "totalPrice": 179.98,
      "createdAt": "2026-07-17T14:30:00Z"
    }
  ]
}
```

**OrderStatus values:** `pending` | `confirmed` | `shipped` | `delivered` | `cancelled`

---

### 8. List User Orders

```
GET /api/orders
```

**Auth:** JWT required

**Query Parameters:**

| Param | Type | Default |
|-------|------|---------|
| `page` | int | 0 |
| `size` | int | 10 |
| `sort` | string | — |

**Response:** `200 OK` → `Page<Order>` (same structure as #7)

---

### 9. Get Order by ID

```
GET /api/orders/{id}
```

**Auth:** JWT required (returns 404 if order doesn't belong to user)

**Response:** `200 OK` → `Order`

---

## Error Responses

**400 Bad Request** — validation errors:
```json
{
  "type": "about:blank",
  "title": "Bad Request",
  "status": 400,
  "detail": "email: must not be blank, password: size must be between 8 and 2147483647"
}
```

**401 Unauthorized** — missing/invalid JWT

**404 Not Found**:
```json
{
  "type": "about:blank",
  "title": "Not Found",
  "status": 404,
  "detail": "Product not found: 999"
}
```

---

## Architecture

```
Angular (localhost:4200)
    │
    │ HTTP + JWT Bearer
    ▼
Spring Boot (localhost:8080)
    │
    ├── PostgreSQL (localhost:5433)
    │
    └── FastAPI (localhost:8000) — GET /recommendations/{userId}
```
