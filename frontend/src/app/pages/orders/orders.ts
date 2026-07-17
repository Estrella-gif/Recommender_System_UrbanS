import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Order } from '../../models';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-16">
      <h1 class="text-3xl font-bold text-zinc-900 dark:text-white mb-10">My Orders</h1>

      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3]; track i) {
            <div class="animate-pulse h-24 bg-zinc-100 dark:bg-zinc-800 rounded-2xl"></div>
          }
        </div>
      }

      @if (!loading() && orders().length) {
        <div class="space-y-4">
          @for (order of orders(); track order.id) {
            <a [routerLink]="['/orders', order.id]"
               class="block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:border-lime-400/50 transition-all">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-semibold text-zinc-900 dark:text-white">Order #{{ order.orderNumber }}</p>
                  <p class="text-sm text-zinc-500 mt-1">{{ order.createdAt | date:'medium' }}</p>
                </div>
                <div class="text-right">
                  <span [class]="statusColor(order.status) + ' text-xs font-medium px-3 py-1 rounded-full'">
                    {{ order.status }}
                  </span>
                  <p class="text-lg font-bold text-zinc-900 dark:text-white mt-2">\${{ order.total }}</p>
                </div>
              </div>
            </a>
          }
        </div>
      }

      @if (!loading() && !orders().length) {
        <div class="text-center py-16">
          <p class="text-6xl mb-6">&#x1F4E6;</p>
          <p class="text-zinc-500">No orders yet.</p>
        </div>
      }

      @if (page() > 0 || hasMore()) {
        <div class="flex justify-center gap-2 mt-8">
          <button (click)="prevPage()" [disabled]="page() === 0"
            class="px-4 py-2 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-zinc-800 disabled:opacity-40 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Previous</button>
          <button (click)="nextPage()" [disabled]="!hasMore()"
            class="px-4 py-2 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-zinc-800 disabled:opacity-40 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Next</button>
        </div>
      }
    </div>
  `,
})
export class OrdersPage implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(true);
  page = signal(0);
  private totalPages = signal(1);

  constructor(private orderService: OrderService) {}

  ngOnInit(): void { this.loadOrders(); }

  loadOrders(): void {
    this.loading.set(true);
    this.orderService.list(this.page()).subscribe({
      next: (p) => {
        this.orders.set(p.content);
        this.totalPages.set(p.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  statusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status] || '';
  }

  hasMore(): boolean { return this.page() < this.totalPages() - 1; }
  prevPage(): void { this.page.update(p => Math.max(0, p - 1)); this.loadOrders(); }
  nextPage(): void { this.page.update(p => p + 1); this.loadOrders(); }
}
