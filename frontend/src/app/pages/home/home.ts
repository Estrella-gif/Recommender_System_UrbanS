import { Component, OnInit, signal, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product, Recommendation } from '../../models';
import { ProductService } from '../../services/product.service';
import { RecommendationService } from '../../services/recommendation.service';
import { CartService } from '../../services/cart.service';
import { ProductCard } from '../../shared/product-card/product-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductCard, RouterLink],
  template: `
    <main class="bg-paper dark:bg-ink text-ink dark:text-paper min-h-screen">
      <!-- HERO -->
      <section class="relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=1600" alt="" class="absolute inset-0 h-full w-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/20"></div>
        <div class="relative mx-auto max-w-7xl px-5 pt-28 pb-16 sm:pt-36 sm:pb-24">
          <p class="font-mono text-lime text-xs sm:text-sm tracking-widest mb-4">SS26 · DROP 004</p>
          <h1 class="font-display text-paper text-[16vw] leading-[0.85] sm:text-8xl md:text-9xl">WEAR<br />THE<br />CITY</h1>
          <p class="mt-6 max-w-md text-smoke/90 text-base sm:text-lg font-medium">
            Streetwear diseñado en la calle, cortado para durar. Piezas limitadas, sin excusas.
          </p>
          <a routerLink="/" class="mt-8 inline-flex items-center gap-2 rounded-full bg-lime px-7 py-3.5 font-bold text-ink hover:bg-paper transition-colors">
            Explorar colección <span aria-hidden="true">→</span>
          </a>
        </div>

        <!-- MARQUEE -->
        <div class="marquee py-2.5 relative">
          <div class="marquee__track font-mono text-xs sm:text-sm">
            @for (i of [0,1]; track i) {
              <span class="flex items-center gap-8 px-4">
                <span>ENVÍO GRATIS DESDE \$150</span><span aria-hidden="true">✦</span>
                <span>DROP 004 — STOCK LIMITADO</span><span aria-hidden="true">✦</span>
                <span>NUEVOS COLORWAYS CADA VIERNES</span><span aria-hidden="true">✦</span>
                <span>DEVOLUCIONES EN 30 DÍAS</span><span aria-hidden="true">✦</span>
              </span>
            }
          </div>
        </div>
      </section>

      <!-- TRENDING NOW -->
      <section class="mx-auto max-w-7xl px-5 pt-14">
        <div class="flex items-baseline justify-between mb-6">
          <h2 class="font-display text-3xl sm:text-4xl">Trending Now</h2>
        </div>
        <div class="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          @if (loadingPopular()) {
            @for (i of [1,2,3,4]; track i) {
              <div class="skeleton h-72 w-52 shrink-0 rounded-xl"></div>
            }
          } @else {
            @for (item of popular(); track item.productId) {
              <article class="group relative w-52 shrink-0 fade-in">
                <div class="hangtag">\${{ item.price }}</div>
                <a [routerLink]="['/product', item.productId]" class="block">
                  <div class="card-hover rounded-xl bg-smoke dark:bg-charcoal overflow-hidden">
                    <div class="aspect-[3/4] bg-ink/5 dark:bg-paper/5">
                      @if (item.imageUrl) {
                        <img [src]="item.imageUrl" [alt]="item.name" class="h-full w-full object-cover" />
                      } @else {
                        <div class="h-full w-full flex items-center justify-center font-display text-4xl opacity-20">US</div>
                      }
                    </div>
                    <div class="p-3">
                      <p class="font-mono text-[10px] uppercase opacity-60">{{ item.brand }}</p>
                      <h3 class="font-bold text-sm leading-tight mt-0.5">{{ item.name }}</h3>
                      @if (item.score > 0) {
                        <div class="mt-2 h-1 w-full rounded-full bg-ink/10 dark:bg-paper/10">
                          <div class="h-1 rounded-full bg-lime" [style.width.%]="item.score * 100"></div>
                        </div>
                      }
                    </div>
                  </div>
                </a>
              </article>
            }
          }
        </div>
      </section>

      <!-- PRODUCT GRID -->
      <section class="mx-auto max-w-7xl px-5 py-14">
        <h2 class="font-display text-3xl sm:text-4xl mb-6">Todo el catálogo</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @if (loading()) {
            @for (i of [1,2,3,4,5,6,7,8]; track i) {
              <div class="skeleton h-80 rounded-xl"></div>
            }
          } @else if (products().length === 0) {
            <div class="col-span-full text-center py-20">
              <p class="font-display text-2xl mb-2">SIN RESULTADOS</p>
              <p class="text-sm opacity-60">No encontramos productos. Prueba con otro término.</p>
            </div>
          } @else {
            @for (product of products(); track product.id) {
              <app-product-card [product]="product" (onAddToCart)="addToCart($event)" />
            }
          }
        </div>

        @if (!loading() && totalPages() > 1) {
          <div class="mt-10 flex items-center justify-center gap-2 font-mono text-sm">
            <button type="button" [disabled]="page() === 0" (click)="changePage(page()-1)"
              class="rounded-full border border-ink/15 dark:border-paper/15 px-3 py-1.5 disabled:opacity-30">←</button>
            <span class="px-2">{{ page() + 1 }} / {{ totalPages() }}</span>
            <button type="button" [disabled]="page() >= totalPages() - 1" (click)="changePage(page()+1)"
              class="rounded-full border border-ink/15 dark:border-paper/15 px-3 py-1.5 disabled:opacity-30">→</button>
          </div>
        }
      </section>
    </main>
  `,
})
export class HomePage implements OnInit {
  products = signal<Product[]>([]);
  popular = signal<Recommendation[]>([]);
  loading = signal(true);
  loadingPopular = signal(true);
  page = signal(0);
  totalPages = signal(1);
  searchTerm = '';

  constructor(
    private productService: ProductService,
    private recommendationService: RecommendationService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    effect(() => {
      const q = this.route.snapshot.queryParamMap.get('q');
      if (q) this.searchTerm = q;
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['q'] || '';
      this.page.set(Number(params['page']) || 0);
      this.loadProducts();
    });
    this.recommendationService.getPopular(8).subscribe({
      next: (r) => { this.popular.set(r); this.loadingPopular.set(false); },
      error: () => this.loadingPopular.set(false),
    });
  }

  loadProducts(): void {
    this.loading.set(true);
    const q = this.searchTerm.trim() || undefined;
    this.productService.search(q, undefined, undefined, this.page()).subscribe({
      next: (p) => {
        this.products.set(p.content);
        this.totalPages.set(p.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  addToCart(product: Product): void {
    this.cartService.add(product);
  }

  changePage(page: number): void {
    this.router.navigate([], { queryParams: { q: this.searchTerm || undefined, page: page || undefined }, queryParamsHandling: 'merge' });
  }
}
