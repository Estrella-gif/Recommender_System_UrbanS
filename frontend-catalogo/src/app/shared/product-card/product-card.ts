import { Component, Input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './product-card.html',
})
export class ProductCard {
  @Input({ required: true }) product!: Product;
  readonly onAddToCart = output<Product>();

  discount(): number {
    if (this.product.compareAtPrice && this.product.compareAtPrice > this.product.price) {
      return Math.round((1 - this.product.price / this.product.compareAtPrice) * 100);
    }
    return 0;
  }

  addToCart(event: Event): void {
    event.preventDefault();
    this.onAddToCart.emit(this.product);
  }
}
