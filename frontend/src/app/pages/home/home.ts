import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product, Recommendation } from '../../models';
import { ProductService } from '../../services/product.service';
import { RecommendationService } from '../../services/recommendation.service';
import { CartService } from '../../services/cart.service';
import { ProductCard } from '../../shared/product-card/product-card';
import { SearchBar } from '../../shared/search-bar/search-bar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductCard, SearchBar, RouterLink],
  template: `
    <section class="relative bg-zinc-900 text-white">
      <div class="max-w-7xl mx-auto px-4 py-24 md:py-32 text-center">
        <h1 class="text-4xl md:text-6xl font-black tracking-tight mb-4">
          Define Your <span class="text-lime-400">Style</span>
        </h1>
        <p class="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
          Streetwear, sneakers y accesorios seleccionados para ti.
        </p>
        <app-search-bar (onSearch)="query.set($event)" />
      </div>
    </section>

    @if (popular().length) {
      <section class="max-w-7xl mx-auto px-4 py-16">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold text-zinc-900 dark:text-white">Trending Now</h2>
          <a routerLink="/recommendations" class="text-sm text-lime-500 hover:text-lime-400 font-medium transition-colors">
            See all &rarr;
          </a>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (item of popular(); track item.productId) {
            <app-product-card [product]="$any(item)" (onAddToCart)="addToCart($any(item))" />
          }
        </div>
      </section>
    }

    <section class="max-w-7xl mx-auto px-4 py-16 border-t border-zinc-200 dark:border-zinc-800">
      <h2 class="text-2xl font-bold text-zinc-900 dark:text-white mb-8">All Products</h2>
      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <div class="animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-2xl aspect-[3/4]"></div>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (product of products(); track product.id) {
            <app-product-card [product]="product" (onAddToCart)="addToCart($event)" />
          }
        </div>
        @if (totalPages() > 1) {
          <div class="flex justify-center gap-2 mt-10">
            <button (click)="prevPage()" [disabled]="page() === 0"
              class="px-4 py-2 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-zinc-800 disabled:opacity-40 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              Previous
            </button>
            <span class="px-4 py-2 text-sm text-zinc-500">{{ page() + 1 }} / {{ totalPages() }}</span>
            <button (click)="nextPage()" [disabled]="page() >= totalPages() - 1"
              class="px-4 py-2 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-zinc-800 disabled:opacity-40 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              Next
            </button>
          </div>
        }
      }
    </section>
  `,
})
export class HomePage implements OnInit {
  products = signal<Product[]>([]);
  popular = signal<Recommendation[]>([]);
  loading = signal(true);
  query = signal('');
  page = signal(0);
  totalPages = signal(1);

  constructor(
    private productService: ProductService,
    private recommendationService: RecommendationService,
    private cartService: CartService,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.recommendationService.getPopular(8).subscribe({
      next: (r) => this.popular.set(r),
    });
  }

  loadProducts(): void {
    this.loading.set(true);
    const q = this.query().trim() || undefined;
    this.productService.search(q, undefined, undefined, this.page()).subscribe({
      next: (page) => {
        this.products.set(page.content);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  addToCart(item: any): void {
    this.cartService.add(item);
  }

  prevPage(): void { this.page.update(p => Math.max(0, p - 1)); this.loadProducts(); }
  nextPage(): void { this.page.update(p => p + 1); this.loadProducts(); }
}
