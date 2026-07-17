import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Recommendation } from '../../models';
import { RecommendationService } from '../../services/recommendation.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ProductCard } from '../../shared/product-card/product-card';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [ProductCard, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-16">
      <h1 class="text-3xl font-bold text-zinc-900 dark:text-white mb-2">For You</h1>
      <p class="text-zinc-500 mb-10">Personalized picks based on your style.</p>

      @if (!auth.isAuthenticated()) {
        <div class="text-center py-16">
          <p class="text-zinc-500 mb-4">Sign in to get personalized recommendations.</p>
          <a routerLink="/login" class="inline-block bg-lime-400 text-black font-semibold px-6 py-3 rounded-xl hover:bg-lime-300 transition-colors">Sign in</a>
        </div>
      }

      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (i of [1,2,3,4]; track i) {
            <div class="animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-2xl aspect-[3/4]"></div>
          }
        </div>
      }

      @if (recommendations().length) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (item of recommendations(); track item.productId) {
            <app-product-card [product]="$any(item)" (onAddToCart)="addToCart($any(item))" />
          }
        </div>
      }

      @if (!loading() && !recommendations().length && auth.isAuthenticated()) {
        <div class="text-center py-16">
          <p class="text-zinc-500">No recommendations yet. Start browsing to get personalized picks!</p>
        </div>
      }
    </div>
  `,
})
export class RecommendationsPage implements OnInit {
  recommendations = signal<Recommendation[]>([]);
  loading = signal(true);

  constructor(
    private recommendationService: RecommendationService,
    private cartService: CartService,
    readonly auth: AuthService,
  ) {}

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.recommendationService.getForUser().subscribe({
        next: (r) => { this.recommendations.set(r); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
    } else {
      this.loading.set(false);
    }
  }

  addToCart(item: any): void {
    this.cartService.add(item);
  }
}
