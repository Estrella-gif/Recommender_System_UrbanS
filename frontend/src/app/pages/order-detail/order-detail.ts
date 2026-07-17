import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Order } from '../../models';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    @if (order(); as order) {
      <div class="max-w-3xl mx-auto px-4 py-16">
        <a routerLink="/orders" class="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-6 inline-block">&larr; Back to orders</a>

        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-2xl font-bold text-zinc-900 dark:text-white">Order #{{ order.orderNumber }}</h1>
            <p class="text-sm text-zinc-500 mt-1">{{ order.createdAt | date:'medium' }}</p>
          </div>
          <span [class]="(statusColor(order.status)) + ' text-xs font-medium px-3 py-1 rounded-full'">
            {{ order.status }}
          </span>
        </div>

        <div class="space-y-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 mb-8">
          @for (item of order.items; track item.id) {
            <div class="flex items-center gap-4 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
              <div class="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                @if (item.product.imageUrl) {
                  <img [src]="item.product.imageUrl" [alt]="item.product.name" class="w-full h-full object-cover rounded-xl" />
                } @else {
                  <span class="text-lg text-zinc-300">&#x1F455;</span>
                }
              </div>
              <div class="flex-1">
                <p class="font-medium text-zinc-900 dark:text-white">{{ item.product.name }}</p>
                <p class="text-sm text-zinc-500">{{ item.product.brand }} &middot; Qty: {{ item.quantity }}</p>
              </div>
              <p class="font-medium text-zinc-900 dark:text-white">\${{ item.totalPrice }}</p>
            </div>
          }
        </div>

        <div class="bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-6 space-y-2">
          <div class="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
            <span>Subtotal</span>
            <span>\${{ order.subtotal }}</span>
          </div>
          <div class="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
            <span>Shipping</span>
            <span>{{ order.shippingCost > 0 ? '$' + order.shippingCost : 'Free' }}</span>
          </div>
          <div class="flex justify-between font-bold text-lg text-zinc-900 dark:text-white pt-2 border-t border-zinc-300 dark:border-zinc-700">
            <span>Total</span>
            <span>\${{ order.total }}</span>
          </div>
        </div>

        @if (order.shippingAddress) {
          <div class="mt-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <h3 class="font-semibold text-zinc-900 dark:text-white mb-2">Shipping address</h3>
            <pre class="text-sm text-zinc-500 whitespace-pre-wrap font-sans">{{ order.shippingAddress }}</pre>
          </div>
        }
      </div>
    } @else {
      <div class="text-center py-24">
        <p class="text-zinc-500">Order not found.</p>
      </div>
    }
  `,
})
export class OrderDetailPage implements OnInit {
  order = signal<Order | null>(null);

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
  ) {}

  statusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || '';
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getById(id).subscribe({
      next: (o) => this.order.set(o),
    });
  }
}
