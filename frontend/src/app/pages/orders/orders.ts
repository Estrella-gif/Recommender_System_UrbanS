import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, NgClass } from '@angular/common';
import { Order } from '../../models';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [RouterLink, DecimalPipe, NgClass],
  templateUrl: './orders.html',
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
