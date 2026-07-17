import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <main class="bg-paper dark:bg-ink text-ink dark:text-paper min-h-screen">
      <div class="mx-auto max-w-5xl px-5 py-10">
        <h1 class="font-display text-4xl sm:text-5xl mb-8">Tu carrito</h1>

        @if (cart.cartItems().length === 0) {
          <div class="text-center py-24">
            <p class="font-display text-3xl mb-3">CARRITO VACÍO</p>
            <p class="text-sm opacity-60 mb-8">Todavía no agregaste nada. La calle está esperando.</p>
            <a routerLink="/" class="inline-flex rounded-full bg-lime text-ink font-bold px-7 py-3.5 hover:bg-ink hover:text-paper dark:hover:bg-paper transition-colors">Empezar a comprar</a>
          </div>
        } @else {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <ul class="lg:col-span-2 space-y-4">
              @for (item of cart.cartItems(); track item.product.id) {
                <li class="fade-in flex gap-4 rounded-xl bg-smoke dark:bg-charcoal p-4"
                  [class.opacity-0]="removingId() === item.product.id" style="transition: opacity 0.25s ease">
                  <div class="h-24 w-20 shrink-0 rounded-lg overflow-hidden bg-ink/5 dark:bg-paper/5">
                    @if (item.product.imageUrl) {
                      <img [src]="item.product.imageUrl" [alt]="item.product.name" class="h-full w-full object-cover" />
                    }
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between gap-2">
                      <div class="min-w-0">
                        <p class="font-mono text-[10px] uppercase opacity-60">{{ item.product.brand || 'UrbanSoul' }}</p>
                        <h3 class="font-bold truncate">{{ item.product.name }}</h3>
                      </div>
                      <button type="button" (click)="removeItem(item.product.id)"
                        class="shrink-0 h-7 w-7 grid place-items-center rounded-full hover:bg-danger hover:text-paper transition-colors">✕</button>
                    </div>
                    <div class="mt-3 flex items-center justify-between">
                      <div class="flex items-center rounded-full border border-ink/15 dark:border-paper/15">
                        <button type="button" (click)="cart.updateQuantity(item.product.id, item.quantity - 1)"
                          class="h-8 w-8 grid place-items-center font-bold disabled:opacity-30" [disabled]="item.quantity <= 1">−</button>
                        <span class="w-8 text-center font-mono text-sm">{{ item.quantity }}</span>
                        <button type="button" (click)="cart.updateQuantity(item.product.id, item.quantity + 1)"
                          class="h-8 w-8 grid place-items-center font-bold disabled:opacity-30" [disabled]="item.quantity >= item.product.stockQuantity">+</button>
                      </div>
                      <p class="font-mono font-bold">\${{ (item.product.price * item.quantity) | number:'1.2-2' }}</p>
                    </div>
                  </div>
                </li>
              }
            </ul>

            <aside class="lg:sticky lg:top-24 h-fit rounded-xl bg-ink text-paper dark:bg-paper dark:text-ink p-6">
              <h2 class="font-display text-2xl mb-4">Resumen</h2>
              <dl class="space-y-2 font-mono text-sm">
                <div class="flex justify-between"><dt class="opacity-70">Subtotal</dt><dd>\${{ cart.subtotal() | number:'1.2-2' }}</dd></div>
                <div class="flex justify-between"><dt class="opacity-70">Envío</dt><dd>Gratis</dd></div>
              </dl>
              <div class="mt-4 pt-4 border-t border-paper/15 dark:border-ink/15 flex justify-between font-mono font-bold text-lg">
                <span>Total</span><span>\${{ cart.subtotal() | number:'1.2-2' }}</span>
              </div>
              <a routerLink="/checkout"
                class="mt-6 w-full block text-center rounded-full bg-lime text-ink font-bold py-3.5 hover:opacity-90 transition-opacity">
                Proceder al pago
              </a>
            </aside>
          </div>
        }
      </div>
    </main>
  `,
})
export class CartPage {
  removingId = signal<number | null>(null);

  constructor(readonly cart: CartService) {}

  removeItem(productId: number): void {
    this.removingId.set(productId);
    setTimeout(() => {
      this.cart.remove(productId);
      this.removingId.set(null);
    }, 250);
  }
}
