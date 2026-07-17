import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { Order } from '../../models';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe, NgClass],
  templateUrl: './order-detail.html',
})
export class OrderDetailPage implements OnInit {
  order = signal<Order | null>(null);
  loading = signal(true);
  statusSteps = ['pending', 'confirmed', 'shipped', 'delivered'];

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getById(id).subscribe({
      next: (o) => { this.order.set(o); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  parsedAddress(): { fullName: string; address: string; city: string; postalCode: string; phone: string } | null {
    const addr = this.order()?.shippingAddress;
    if (!addr) return null;
    try { return JSON.parse(addr); } catch { return null; }
  }

  statusIndex(status: string): number {
    return this.statusSteps.indexOf(status);
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
