import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main class="bg-paper dark:bg-ink text-ink dark:text-paper min-h-screen">
      <div class="mx-auto max-w-6xl px-5 py-8">
        <nav class="font-mono text-xs opacity-60 mb-6 flex items-center gap-2" aria-label="Breadcrumb">
          <a routerLink="/" class="hover:text-lime hover:opacity-100">Home</a>
          <span>/</span>
          <span class="opacity-100">{{ product()?.name }}</span>
        </nav>

        @if (loading()) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div class="skeleton aspect-square rounded-xl"></div>
            <div class="space-y-4">
              <div class="skeleton h-8 w-2/3 rounded"></div>
              <div class="skeleton h-5 w-1/3 rounded"></div>
              <div class="skeleton h-24 w-full rounded"></div>
            </div>
          </div>
        } @else if (product(); as p) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div class="relative">
              <div class="hangtag text-base">\${{ p.price }}</div>
              <div class="aspect-square rounded-xl bg-smoke dark:bg-charcoal overflow-hidden">
                @if (p.imageUrl) {
                  <img [src]="p.imageUrl" [alt]="p.name" class="h-full w-full object-cover fade-in" />
                } @else {
                  <div class="h-full w-full flex items-center justify-center font-display text-6xl opacity-15">US</div>
                }
              </div>
              <div class="mt-4 grid grid-cols-4 gap-3">
                @for (i of [0,1,2,3]; track i) {
                  <button type="button" class="aspect-square rounded-lg border-2 overflow-hidden bg-smoke dark:bg-charcoal"
                    [class.border-lime]="i === 0" [class.border-transparent]="i !== 0">
                    @if (p.imageUrl) {
                      <img [src]="p.imageUrl" alt="" class="h-full w-full object-cover opacity-90" />
                    }
                  </button>
                }
              </div>
            </div>

            <div>
              <p class="font-mono text-xs uppercase tracking-wide opacity-60">{{ p.brand || 'UrbanSoul' }}</p>
              <h1 class="font-display text-4xl sm:text-5xl leading-[0.9] mt-2">{{ p.name }}</h1>

              <div class="tag-perforated inline-flex items-center gap-2 mt-4 px-3 py-1.5">
                <span class="font-mono text-xs opacity-60">SKU</span>
                <span class="font-mono text-xs font-bold">{{ p.sku || 'N/A' }}</span>
              </div>

              <div class="mt-6 flex items-baseline gap-3">
                <span class="font-mono text-3xl font-bold">\${{ p.price }}</span>
                @if (p.compareAtPrice && p.compareAtPrice > p.price) {
                  <span class="font-mono text-lg line-through opacity-40">\${{ p.compareAtPrice }}</span>
                  <span class="rounded-full bg-danger text-paper text-xs font-bold px-2.5 py-1">
                    -{{ discount(p) }}%
                  </span>
                }
              </div>

              <p class="mt-3 font-mono text-sm"
                [class.text-danger]="p.stockQuantity < 5"
                [class.text-lime]="p.stockQuantity >= 5">
                @if (p.stockQuantity > 0) {
                  ● Solo quedan {{ p.stockQuantity }}
                } @else {
                  ● Agotado
                }
              </p>

              @if (p.description) {
                <div class="mt-6 border-t border-ink/10 dark:border-paper/10 pt-6">
                  <p class="text-sm leading-relaxed opacity-80"
                    [class.line-clamp-3]="!descriptionExpanded()">
                    {{ p.description }}
                  </p>
                  <button type="button" (click)="descriptionExpanded.set(!descriptionExpanded())"
                    class="mt-2 font-mono text-xs font-bold underline underline-offset-4">
                    {{ descriptionExpanded() ? 'Ver menos' : 'Leer más' }}
                  </button>
                </div>
              }

              <div class="mt-8 flex items-center gap-4">
                <div class="flex items-center rounded-full border border-ink/15 dark:border-paper/15">
                  <button type="button" (click)="changeQuantity(-1)" [disabled]="quantity() <= 1"
                    class="h-11 w-11 grid place-items-center font-bold text-lg disabled:opacity-30" aria-label="Reducir">−</button>
                  <span class="w-10 text-center font-mono font-bold">{{ quantity() }}</span>
                  <button type="button" (click)="changeQuantity(1)" [disabled]="quantity() >= p.stockQuantity"
                    class="h-11 w-11 grid place-items-center font-bold text-lg disabled:opacity-30" aria-label="Aumentar">+</button>
                </div>
                <button type="button" (click)="addToCart()" [disabled]="p.stockQuantity === 0"
                  class="flex-1 rounded-full bg-lime text-ink font-bold py-3.5 hover:bg-ink hover:text-paper
                         dark:hover:bg-paper dark:hover:text-ink transition-colors disabled:opacity-40">
                  {{ p.stockQuantity === 0 ? 'Agotado' : 'Agregar al carrito' }}
                </button>
              </div>
            </div>
          </div>
        } @else {
          <div class="text-center py-24">
            <p class="font-display text-2xl mb-2">NO ENCONTRADO</p>
            <p class="text-sm opacity-60">El producto que buscas no existe o fue eliminado.</p>
          </div>
        }
      </div>
    </main>
  `,
})
export class ProductDetailPage implements OnInit {
  product = signal<Product | null>(null);
  loading = signal(true);
  quantity = signal(1);
  descriptionExpanded = signal(false);

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getById(id).subscribe({
      next: (p) => { this.product.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  discount(p: Product): number {
    if (p.compareAtPrice && p.compareAtPrice > p.price) {
      return Math.round((1 - p.price / p.compareAtPrice) * 100);
    }
    return 0;
  }

  changeQuantity(delta: number): void {
    this.quantity.update(q => Math.max(1, Math.min(q + delta, this.product()?.stockQuantity || 1)));
  }

  addToCart(): void {
    const p = this.product();
    if (p) this.cartService.add(p, this.quantity());
  }
}
