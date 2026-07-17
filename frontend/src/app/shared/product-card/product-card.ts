import { Component, Input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a [routerLink]="['/product', product.id]"
       class="group block bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 hover:border-lime-400/50 dark:hover:border-lime-400/50 hover:shadow-xl transition-all duration-300">
      <div class="aspect-[3/4] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
        @if (product.imageUrl) {
          <img [src]="product.imageUrl" [alt]="product.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        } @else {
          <span class="text-4xl text-zinc-300 dark:text-zinc-600">&#x1F455;</span>
        }
      </div>
      <div class="p-4">
        <p class="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">{{ product.brand || 'UrbanSoul' }}</p>
        <h3 class="font-semibold text-zinc-900 dark:text-white truncate">{{ product.name }}</h3>
        <div class="flex items-center gap-2 mt-2">
          <span class="text-lg font-bold text-zinc-900 dark:text-white">\${{ product.price }}</span>
          @if (product.compareAtPrice && product.compareAtPrice > product.price) {
            <span class="text-sm text-zinc-400 line-through">\${{ product.compareAtPrice }}</span>
          }
        </div>
        <button
          (click)="addToCart($event)"
          class="mt-3 w-full py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-xl hover:bg-lime-400 hover:text-black dark:hover:bg-lime-400 transition-colors">
          Add to cart
        </button>
      </div>
    </a>
  `,
})
export class ProductCard {
  @Input({ required: true }) product!: Product;
  readonly onAddToCart = output<Product>();

  addToCart(event: Event): void {
    event.preventDefault();
    this.onAddToCart.emit(this.product);
  }
}
