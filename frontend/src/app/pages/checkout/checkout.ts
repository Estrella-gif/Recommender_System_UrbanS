import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-16">
      <h1 class="text-3xl font-bold text-zinc-900 dark:text-white mb-10">Checkout</h1>

      <div class="space-y-2 mb-8">
        @for (item of cart.cartItems(); track item.product.id) {
          <div class="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
            <span>{{ item.product.name }} &times; {{ item.quantity }}</span>
            <span>\${{ (item.product.price * item.quantity).toFixed(2) }}</span>
          </div>
        }
        <div class="flex justify-between font-bold text-lg text-zinc-900 dark:text-white pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <span>Total</span>
          <span>\${{ cart.subtotal().toFixed(2) }}</span>
        </div>
      </div>

      <h3 class="font-semibold text-zinc-900 dark:text-white mb-4">Shipping address</h3>
      <form (ngSubmit)="placeOrder()" #f="ngForm" class="space-y-4">
        <input [(ngModel)]="name" name="name" placeholder="Full name" required
          class="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-lime-400 transition-colors" />
        <input [(ngModel)]="address" name="address" placeholder="Address" required
          class="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-lime-400 transition-colors" />
        <div class="grid grid-cols-2 gap-4">
          <input [(ngModel)]="city" name="city" placeholder="City" required
            class="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-lime-400 transition-colors" />
          <input [(ngModel)]="zip" name="zip" placeholder="ZIP code" required
            class="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-lime-400 transition-colors" />
        </div>
        <input [(ngModel)]="phone" name="phone" placeholder="Phone number"
          class="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-lime-400 transition-colors" />

        @if (error()) {
          <p class="text-red-500 text-sm">{{ error() }}</p>
        }

        <button type="submit" [disabled]="!f.valid || loading() || !cart.cartItems().length"
          class="w-full py-4 bg-lime-400 text-black font-bold text-lg rounded-2xl hover:bg-lime-300 disabled:opacity-40 transition-colors">
          {{ loading() ? 'Placing order...' : 'Confirm order' }}
        </button>
      </form>
    </div>
  `,
})
export class CheckoutPage {
  name = '';
  address = '';
  city = '';
  zip = '';
  phone = '';
  loading = signal(false);
  error = signal('');

  constructor(
    readonly cart: CartService,
    private orderService: OrderService,
    private router: Router,
  ) {}

  placeOrder(): void {
    this.loading.set(true);
    this.error.set('');

    const addressJson = JSON.stringify({
      name: this.name,
      address: this.address,
      city: this.city,
      zip: this.zip,
      phone: this.phone,
    });

    this.orderService.create(this.cart.toOrderItems()).subscribe({
      next: (order) => {
        this.cart.clear();
        this.router.navigate(['/orders', order.id]);
      },
      error: (err) => {
        this.error.set(err.error?.detail || 'Failed to place order');
        this.loading.set(false);
      },
    });
  }
}
