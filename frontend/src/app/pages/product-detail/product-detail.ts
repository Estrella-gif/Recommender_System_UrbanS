import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (product(); as p) {
      <div class="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-12">
        <div class="aspect-[3/4] bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center overflow-hidden">
          @if (p.imageUrl) {
            <img [src]="p.imageUrl" [alt]="p.name" class="w-full h-full object-cover" />
          } @else {
            <span class="text-6xl text-zinc-300">&#x1F455;</span>
          }
        </div>
        <div class="flex flex-col justify-center">
          <p class="text-sm text-zinc-500 uppercase tracking-wide">{{ p.brand || 'UrbanSoul' }}</p>
          <h1 class="text-3xl font-bold text-zinc-900 dark:text-white mt-2">{{ p.name }}</h1>
          <div class="flex items-baseline gap-3 mt-4">
            <span class="text-2xl font-bold text-zinc-900 dark:text-white">\${{ p.price }}</span>
            @if (p.compareAtPrice && p.compareAtPrice > p.price) {
              <span class="text-lg text-zinc-400 line-through">\${{ p.compareAtPrice }}</span>
            }
          </div>
          @if (p.stockQuantity > 0) {
            <p class="text-sm text-lime-600 mt-2">Only {{ p.stockQuantity }} left in stock</p>
          } @else {
            <p class="text-sm text-red-500 mt-2">Out of stock</p>
          }
          @if (p.description) {
            <p class="text-zinc-600 dark:text-zinc-400 mt-6 leading-relaxed">{{ p.description }}</p>
          }
          <div class="flex items-center gap-3 mt-8">
            <input type="number" [ngModel]="quantity()" (ngModelChange)="quantity.set($event)" min="1" [max]="p.stockQuantity"
              class="w-20 px-3 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-center text-sm" />
            <button (click)="addToCart()" [disabled]="p.stockQuantity === 0"
              class="flex-1 py-3 bg-lime-400 text-black font-semibold rounded-xl hover:bg-lime-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Add to cart
            </button>
          </div>
          <p class="text-xs text-zinc-400 mt-4">{{ p.categoryName || p.categoryCode }} &middot; SKU: {{ p.sku || 'N/A' }}</p>
        </div>
      </div>
    } @else {
      <div class="max-w-7xl mx-auto px-4 py-24 text-center">
        <p class="text-zinc-500">Product not found.</p>
      </div>
    }
  `,
})
export class ProductDetailPage implements OnInit {
  product = signal<Product | null>(null);
  quantity = signal(1);

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getById(id).subscribe({
      next: (p) => this.product.set(p),
    });
  }

  addToCart(): void {
    const p = this.product();
    if (p) this.cartService.add(p, this.quantity());
  }
}
