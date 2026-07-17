import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, NgClass } from '@angular/common';
import { Order } from '../../models';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [RouterLink, DecimalPipe, NgClass],
  template: `
    <main class="bg-paper dark:bg-ink text-ink dark:text-paper min-h-screen">
      <div class="mx-auto max-w-4xl px-5 py-10">
        <h1 class="font-display text-4xl sm:text-5xl mb-8">Mis pedidos</h1>

        @if (loading()) {
          <div class="space-y-4">
            @for (i of [1,2,3]; track i) {
              <div class="skeleton h-24 rounded-xl"></div>
            }
          </div>
        } @else if (orders().length === 0) {
          <div class="text-center py-24">
            <p class="font-display text-3xl mb-3">SIN PEDIDOS TODAVÍA</p>
            <p class="text-sm opacity-60 mb-8">Cuando compres algo, tu historial va a aparecer acá.</p>
            <a routerLink="/" class="inline-flex rounded-full bg-lime text-ink font-bold px-7 py-3.5 hover:bg-ink hover:text-paper dark:hover:bg-paper transition-colors">Ir a comprar</a>
          </div>
        } @else {
          <ul class="space-y-4">
            @for (order of orders(); track order.id) {
              <li>
                <a [routerLink]="['/orders', order.id]" class="card-hover flex items-center gap-4 rounded-xl bg-smoke dark:bg-charcoal p-5 fade-in">
                  <div class="h-12 w-12 shrink-0 rounded-full grid place-items-center text-lg"
                    [ngClass]="statusIconBg(order.status)">
                    @switch (order.status) {
                      @case ('pending') { <span aria-hidden="true">⏱</span> }
                      @case ('confirmed') { <span aria-hidden="true">✓</span> }
                      @case ('shipped') { <span aria-hidden="true">🚚</span> }
                      @case ('delivered') { <span aria-hidden="true">📦</span> }
                      @case ('cancelled') { <span aria-hidden="true">✕</span> }
                    }
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-mono text-xs opacity-60">#{{ order.orderNumber }}</p>
                    <p class="font-bold">{{ relativeDate(order.createdAt) }}</p>
                  </div>
                  <span class="font-mono text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shrink-0"
                    [ngClass]="statusBadgeBg(order.status)">{{ order.status }}</span>
                  <p class="font-mono font-bold w-20 text-right shrink-0">\${{ order.total | number:'1.2-2' }}</p>
                </a>
              </li>
            }
          </ul>
          @if (totalPages() > 1) {
            <div class="mt-10 flex items-center justify-center gap-2 font-mono text-sm">
              <button type="button" [disabled]="page() === 0" (click)="changePage(page()-1)"
                class="rounded-full border border-ink/15 dark:border-paper/15 px-3 py-1.5 disabled:opacity-30">←</button>
              <span class="px-2">{{ page() + 1 }} / {{ totalPages() }}</span>
              <button type="button" [disabled]="page() >= totalPages() - 1" (click)="changePage(page()+1)"
                class="rounded-full border border-ink/15 dark:border-paper/15 px-3 py-1.5 disabled:opacity-30">→</button>
            </div>
          }
        }
      </div>
    </main>
  `,
})
export class OrdersPage implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(true);
  page = signal(0);
  totalPages = signal(1);

  constructor(private orderService: OrderService) {}

  ngOnInit(): void { this.loadOrders(); }

  loadOrders(): void {
    this.loading.set(true);
    this.orderService.list(this.page()).subscribe({
      next: (p) => { this.orders.set(p.content); this.totalPages.set(p.totalPages); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  changePage(page: number): void { this.page.set(page); this.loadOrders(); }

  relativeDate(dateStr: string): string {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `Hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `Hace ${days} días`;
    return date.toLocaleDateString();
  }

  statusIconBg(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-yellow-400/20 text-yellow-600 dark:text-yellow-400',
      confirmed: 'bg-blue-400/20 text-blue-600 dark:text-blue-400',
      shipped: 'bg-lime/20 text-lime',
      delivered: 'bg-green-400/20 text-green-600 dark:text-green-400',
      cancelled: 'bg-danger/20 text-danger',
    };
    return map[status] || '';
  }

  statusBadgeBg(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-yellow-400/20 text-yellow-700 dark:text-yellow-400',
      confirmed: 'bg-blue-400/20 text-blue-700 dark:text-blue-400',
      shipped: 'bg-lime/30 text-ink dark:text-lime',
      delivered: 'bg-green-400/20 text-green-700 dark:text-green-400',
      cancelled: 'bg-danger/20 text-danger',
    };
    return map[status] || '';
  }
}
