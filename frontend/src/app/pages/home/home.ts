import { Component, OnInit, signal, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product, Recommendation } from '../../models';
import { ProductService } from '../../services/product.service';
import { RecommendationService } from '../../services/recommendation.service';
import { CartService } from '../../services/cart.service';
import { ProductCard } from '../../shared/product-card/product-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductCard, RouterLink],
  templateUrl: './home.html',
})
export class HomePage implements OnInit {
  products = signal<Product[]>([]);
  popular = signal<Recommendation[]>([]);
  loading = signal(true);
  loadingPopular = signal(true);
  page = signal(0);
  totalPages = signal(1);
  searchTerm = '';

  constructor(
    private productService: ProductService,
    private recommendationService: RecommendationService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    effect(() => {
      const q = this.route.snapshot.queryParamMap.get('q');
      if (q) this.searchTerm = q;
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['q'] || '';
      this.page.set(Number(params['page']) || 0);
      this.loadProducts();
    });
    this.recommendationService.getPopular(8).subscribe({
      next: (r) => { this.popular.set(r); this.loadingPopular.set(false); },
      error: () => this.loadingPopular.set(false),
    });
  }

  loadProducts(): void {
    this.loading.set(true);
    const q = this.searchTerm.trim() || undefined;
    this.productService.search(q, undefined, undefined, this.page()).subscribe({
      next: (p) => {
        this.products.set(p.content);
        this.totalPages.set(p.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  addToCart(product: Product): void {
    this.cartService.add(product);
  }

  changePage(page: number): void {
    this.router.navigate([], { queryParams: { q: this.searchTerm || undefined, page: page || undefined }, queryParamsHandling: 'merge' });
  }
}
