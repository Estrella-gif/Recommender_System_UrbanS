import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './product-detail.html',
})
export class ProductDetailPage implements OnInit {
  product = signal<Product | null>(null);
  loading = signal(true);
  quantity = signal(1);
  descriptionExpanded = signal(false);

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getById(id).subscribe({
      next: (p) => { this.product.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  discount(p: Product): number {
    if (p.compareAtPrice && p.compareAtPrice > p.price) {
      return Math.round((1 - p.price / p.compareAtPrice) * 100);
    }
    return 0;
  }

  changeQuantity(delta: number): void {
    this.quantity.update(q => Math.max(1, Math.min(q + delta, this.product()?.stockQuantity || 1)));
  }

  addToCart(): void {
    const p = this.product();
    if (p) this.cartService.add(p, this.quantity());
  }
}
