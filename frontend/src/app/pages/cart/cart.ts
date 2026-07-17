import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-16">
      <h1 class="text-3xl font-bold text-zinc-900 dark:text-white mb-10">Shopping Cart</h1>

      @if (cart.cartItems().length) {
        <div class="space-y-4">
          @for (item of cart.cartItems(); track item.product.id) {
            <div class="flex items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4">
              <div class="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                @if (item.product.imageUrl) {
                  <img [src]="item.product.imageUrl" [alt]="item.product.name" class="w-full h-full object-cover rounded-xl" />
                } @else {
                  <span class="text-2xl text-zinc-300">&#x1F455;</span>
                }
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-zinc-900 dark:text-white truncate">{{ item.product.name }}</p>
                <p class="text-sm text-zinc-500">{{ item.product.brand || 'UrbanSoul' }}</p>
                <p class="text-sm font-medium text-zinc-900 dark:text-white mt-1">\${{ item.product.price }}</p>
              </div>
              <div class="flex items-center gap-2">
                <button (click)="cart.updateQuantity(item.product.id, item.quantity - 1)"
                  class="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm font-medium">-</button>
                <span class="w-8 text-center text-sm font-medium">{{ item.quantity }}</span>
                <button (click)="cart.updateQuantity(item.product.id, item.quantity + 1)"
                  class="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm font-medium">+</button>
              </div>
              <button (click)="cart.remove(item.product.id)"
                class="text-zinc-400 hover:text-red-500 transition-colors text-sm">Remove</button>
            </div>
          }

          <div class="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-6 mt-8">
            <span class="text-lg font-semibold text-zinc-900 dark:text-white">Total</span>
            <span class="text-2xl font-bold text-zinc-900 dark:text-white">\${{ cart.subtotal().toFixed(2) }}</span>
          </div>

          <a routerLink="/checkout"
            class="block w-full text-center py-4 bg-lime-400 text-black font-bold text-lg rounded-2xl hover:bg-lime-300 transition-colors mt-4">
            Proceed to checkout
          </a>
        </div>
      } @else {
        <div class="text-center py-24">
          <p class="text-6xl mb-6">&#x1F6CD;</p>
          <p class="text-zinc-500 text-lg mb-4">Your cart is empty.</p>
          <a routerLink="/" class="inline-block bg-lime-400 text-black font-semibold px-6 py-3 rounded-xl hover:bg-lime-300 transition-colors">Start shopping</a>
        </div>
      }
    </div>
  `,
})
export class CartPage {
  constructor(readonly cart: CartService) {}
}
