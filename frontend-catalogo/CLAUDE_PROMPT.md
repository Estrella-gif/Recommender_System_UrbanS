# Claude Prompt — Diseño UI/UX UrbanSoul E-commerce

Eres un diseñador UI/UX experto en e-commerce de moda urbana. Necesito que rediseñes los templates HTML + TailwindCSS de una tienda de ropa/calzado/accesorios llamada "UrbanSoul" para que luzca profesional, premium y atractiva.

## Contexto técnico

- **Stack:** Angular 21 standalone components con TailwindCSS v4
- **Backend:** Spring Boot REST API — `http://localhost:8080`
- **Auth:** JWT Bearer token
- **Diseño:** Mobile-first, responsive, dark mode vía `dark:` prefix de Tailwind
- **Fuente:** Inter (Google Fonts) o system font stack

## Archivos adjuntos

- `api-contract.md` — Especificación completa de los 9 endpoints REST
- Código fuente de todos los componentes en `src/app/pages/` y `src/app/shared/`

## Estilo visual deseado

- **Paleta:** Negro (#0a0a0a), blanco (#fafafa), acento lime/verde neón (#a3e635) para CTAs y badges
- **Referencia:** Tiendas streetwear premium como Kith, Aimé Leon Dore, Supreme
- **Bordes:** redondeados xl (12px) para cards, full (999px) para botones
- **Sombras:** sutiles (shadow-lg en cards, shadow-xl en navbar sticky)
- **Animaciones:** hover scale(1.02) en cards, fade-in en transiciones de página, skeleton loading con pulso
- **Tipografía:** Headings bold/tracking-tight, body text relajado, precios en negrita

## Páginas a rediseñar

### 1. Home (`pages/home/home.ts`)
- Hero banner: imagen full-width con gradiente oscuro overlay y CTA
- Sección "Trending Now" con 4-8 productos del endpoint `/api/recommendations/popular`
- Grid de productos principal con paginación
- SearchBar integrada en el hero o como sticky debajo del navbar
- Filtros por categoría y marca como pills/tabs horizontales
- ProductCard con hover effect, badge de descuento si `compareAtPrice > price`

### 2. Product Detail (`pages/product-detail/product-detail.ts`)
- Galería de imagen (placeholder si no hay `imageUrl`)
- Info: marca, nombre, precio, precio original tachado, stock indicator
- Descripción colapsable o con "read more"
- Quantity selector con +/- estilizados
- Botón "Add to cart" prominente
- Breadcrumb navigation

### 3. Login / Register (`pages/login/login.ts`)
- Split screen: izquierda branding/marca, derecha formulario
- Tabs "Sign In" / "Create Account" con animación
- Inputs con iconos, focus rings animados
- Validación inline con mensajes de error estilizados
- "Forgot password?" link (placeholder)

### 4. Recommendations (`pages/recommendations/recommendations.ts`)
- Hero pequeño: "Curated for you"
- Grid de productos con score visual (barra de % o estrellas)
- Estado vacío: ilustración/emoji con mensaje amigable si no hay datos
- Estado no autenticado: CTA para login

### 5. Cart (`pages/cart/cart.ts`)
- Lista de items con imagen thumbnail, nombre, cantidad ajustable, subtotal por línea
- Resumen sticky al bottom o sidebar con total y botón checkout
- Badge animado en navbar con número de items
- Animación al eliminar items
- Empty state con CTA "Start shopping"

### 6. Checkout (`pages/checkout/checkout.ts`)
- Layout de 2 columnas: resumen de orden + formulario de envío
- Progress steps (Shipping → Payment → Confirm) — aunque solo shipping esté activo
- Order summary colapsable en mobile
- Inputs agrupados con labels flotantes

### 7. Orders (`pages/orders/orders.ts`)
- Lista con cards: número de orden, fecha relativa ("2 days ago"), status badge colorido, total
- Estados con íconos: pending (reloj), confirmed (check), shipped (camión), delivered (paquete), cancelled (x)
- Empty state con ilustración

### 8. Order Detail (`pages/order-detail/order-detail.ts`)
- Header con número de orden, fecha, status badge grande
- Timeline de estados (opcional, placeholder para futuro)
- Lista de items con imágenes
- Shipping address formateado (parsear el JSON de `shippingAddress`)
- Total breakdown (subtotal, shipping, total)

### 9. Navbar (`shared/navbar/navbar.ts`)
- Sticky con backdrop-blur
- Logo "UrbanSoul" con el "Soul" en lime-400
- SearchBar integrada (en desktop)
- Icono de carrito con badge animado (bounce al agregar items)
- Avatar/usuario con dropdown (My Orders, Sign Out)
- Mobile: hamburger menu con slide-in drawer

## Especificaciones TailwindCSS v4

- NO uses `tailwind.config.js` (v4 se configura vía CSS con `@import 'tailwindcss'`)
- Dark mode: usa `@variant dark` en CSS o `dark:` prefijo en clases
- Usa el archivo `styles.css` para variables CSS custom si es necesario

## Entregables

Para CADA componente, devuelve:
1. El template HTML completo con clases TailwindCSS (listo para reemplazar el `template:` inline actual)
2. Una breve nota de qué datos dinámicos van en cada placeholder (ej: `<!-- {{ product.name }} -->`)
3. Si se necesita algún método nuevo en el .ts, especifícalo

El output debe ser **solo el código del template** para cada componente, uno por uno, en orden de prioridad: Home → ProductDetail → Cart → Checkout → Navbar → Login → Recommendations → Orders → OrderDetail.
