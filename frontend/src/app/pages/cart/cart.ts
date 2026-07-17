import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './cart.html',
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
