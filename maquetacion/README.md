# UrbanSoul — Templates UI/UX

## ⚠️ Nota sobre `api-contract.md`
No llegó adjunto a la conversación, así que los endpoints usados en los comentarios de cada template son **inferidos** de tu brief:

| Acción | Endpoint asumido |
|---|---|
| Listar/buscar productos | `GET /api/products`, `GET /api/products/search?q=` |
| Categorías / marcas (dropdowns) | `GET /api/categories`, `GET /api/brands` |
| Detalle de producto | `GET /api/products/:id` |
| Populares | `GET /api/recommendations/popular` |
| Recomendado para ti (auth) | `GET /api/recommendations/personalized` |
| Login / registro | `POST /api/auth/login`, `POST /api/auth/register` |
| Crear orden | `POST /api/orders` |
| Listar / detalle de órdenes | `GET /api/orders`, `GET /api/orders/:id` |

Si tu contrato real usa otros nombres de campo o rutas, es un find-and-replace directo — la estructura visual no cambia.

## Dirección de diseño
Streetwear premium (Kith / Aimé Leon Dore / Supreme), no genérico:

- **Paleta**: `#0a0a0a` ink · `#fafafa` paper · `#a3e635` lime (acento) · `#84cc16` lime-dim (hover) · `#171717` charcoal (surface dark) · `#e5e5e5` smoke (surface light) · `#ef4444` danger.
- **Tipografía**: **Anton** (display/titulares, condensado tipo flyer) + **Inter** (UI/cuerpo) + **Space Mono** (precios, SKU, stock, folios de orden — da un aire de etiqueta/recibo físico).
- **Signature propio**: hang-tag de precio con `clip-path` (etiqueta troquelada, como una etiqueta de ropa real) en el detalle de producto, + marquee ticker de anuncios de drop bajo el navbar. Todo lo demás queda disciplinado (radios `xl`/`full`, sombras suaves, hover `scale-105`/`scale-[1.02]`, `animate-fade-in` en carga de página) para no competir con esos dos elementos.

## Archivos
```
styles.css              → Tailwind v4 real: @import 'tailwindcss', @theme con tokens, @variant dark, @utility tag-shape
00-navbar.html           → Navbar compartido (logo, links, search, carrito+badge, avatar/login, marquee, drawer mobile)
01-home.html             → Hero + búsqueda/filtros + grid de productos (+ estados loading/empty/error) + Trending Now
02-product-detail.html   → Galería, hang-tag de precio, selector talla/cantidad, stock, "también te puede interesar"
03-auth.html             → Split-screen login/registro con tabs y validación inline
04-recommendations.html  → Estado no-autenticado + grid con match score (% y barra)
05-cart.html             → Lista de items, cantidad, subtotal, estado vacío
06-checkout.html         → Resumen de orden + formulario de dirección + método de pago
07-orders.html           → Lista de órdenes con badges de estado + vista detalle
```

Cada archivo es un **HTML autocontenido** (con Tailwind vía CDN + tu paleta replicada in-line) para que puedas abrirlo y verlo tal cual en el navegador. El **markup interno de cada `<section>`/`<article>` es lo que copias al `template` de tu componente Angular** — los comentarios `<!-- -->` marcan exactamente qué binding (`*ngFor`, `[(ngModel)]`, `{{ }}`, `(click)`) va en cada parte.

> En producción (Angular real) usa `styles.css` tal cual está aquí — Tailwind v4 generará automáticamente utilidades como `bg-ink`, `text-lime`, `bg-charcoal`, etc. a partir del bloque `@theme`. La config inline de `tailwind.config` que ves en cada HTML **es solo para que el preview de CDN se vea igual**; no la necesitas en el proyecto Angular.

## Puntos de integración clave
- **Debounce de búsqueda**: en el componente, `searchTerm$.pipe(debounceTime(300), distinctUntilChanged(), switchMap(...))`.
- **Dark mode**: toggle añade/quita `class="dark"` en `<html>`, persistido en `localStorage` (o `prefers-color-scheme` como default inicial).
- **Carrito**: `CartService` con `signal<CartItem[]>`, serializado a `localStorage` en cada cambio; el badge del navbar lee ese mismo signal.
- **Auth guard**: `/recommendations`, `/orders`, `/checkout` deben ir detrás de un `authGuard` que redirige a `/auth?redirect=<url>`; el login exitoso navega de vuelta a esa URL.
- **Estados de UI**: cada listado (`grid`, `orders`, `recommendations`) sigue el patrón `loading | error | empty | data` — los cuatro están maquetados como referencia en `01-home.html` dentro del `<details>` al final de la sección de grid.

## Siguiente paso sugerido
Si quieres, puedo convertir cualquiera de estos templates en un **componente Angular standalone real** (`.ts` + `.html` separados, con signals e inputs tipados) en vez de solo el fragmento HTML — dime por cuál empezamos.
