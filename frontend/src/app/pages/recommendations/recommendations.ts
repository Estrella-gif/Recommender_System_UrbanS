import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { Recommendation } from '../../models';
import { RecommendationService } from '../../services/recommendation.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <main class="bg-paper dark:bg-ink text-ink dark:text-paper min-h-screen">
      @if (!auth.isAuthenticated()) {
        <div class="mx-auto max-w-md px-5 py-28 text-center">
          <p class="font-display text-4xl mb-4">CURADO<br/>PARA VOS</p>
          <p class="text-sm opacity-60 mb-8">Inicia sesión para ver recomendaciones personalizadas.</p>
          <a routerLink="/login" class="inline-flex rounded-full bg-lime text-ink font-bold px-7 py-3.5 hover:bg-ink hover:text-paper dark:hover:bg-paper transition-colors">Iniciar sesión</a>
        </div>
      } @else {
        <div class="mx-auto max-w-7xl px-5 py-10">
          <div class="mb-10">
            <p class="font-mono text-lime text-xs uppercase tracking-widest mb-2">Para ti</p>
            <h1 class="font-display text-4xl sm:text-5xl">Curated for you</h1>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @if (loading()) {
              @for (i of [1,2,3,4,5,6,7,8]; track i) {
                <div class="skeleton h-80 rounded-xl"></div>
              }
            } @else if (recommendations().length === 0) {
              <div class="col-span-full text-center py-20">
                <p class="font-display text-2xl mb-2">TODAVÍA NADA</p>
                <p class="text-sm opacity-60">Explora el catálogo para que empecemos a entender tu estilo.</p>
                <a routerLink="/" class="mt-6 inline-flex rounded-full bg-lime text-ink font-bold px-6 py-3 hover:bg-ink hover:text-paper dark:hover:bg-paper transition-colors">Explorar productos</a>
              </div>
            } @else {
              @for (item of recommendations(); track item.productId) {
                <a [routerLink]="['/product', item.productId]" class="group relative block fade-in">
                  <div class="hangtag">\${{ item.price }}</div>
                  <div class="card-hover rounded-xl bg-smoke dark:bg-charcoal overflow-hidden">
                    <div class="aspect-[3/4] bg-ink/5 dark:bg-paper/5">
                      @if (item.imageUrl) {
                        <img [src]="item.imageUrl" [alt]="item.name" class="h-full w-full object-cover" />
                      } @else {
                        <div class="h-full w-full flex items-center justify-center font-display text-4xl opacity-20">US</div>
                      }
                    </div>
                    <div class="p-4">
                      <p class="font-mono text-[10px] uppercase opacity-60">{{ item.brand }} · {{ item.categoryCode }}</p>
                      <h3 class="font-bold leading-tight mt-1">{{ item.name }}</h3>
                      @if (item.score > 0) {
                        <div class="mt-3 flex items-center gap-2">
                          <div class="h-1.5 flex-1 rounded-full bg-ink/10 dark:bg-paper/10">
                            <div class="h-1.5 rounded-full bg-lime" [style.width.%]="item.score * 100"></div>
                          </div>
                          <span class="font-mono text-[10px] font-bold">{{ item.score * 100 | number:'1.0-0' }}%</span>
                        </div>
                      } @else {
                        <p class="mt-3 font-mono text-[10px] uppercase opacity-40">Popular ahora</p>
                      }
                    </div>
                  </div>
                </a>
              }
            }
          </div>
        </div>
      }
    </main>
  `,
})
export class RecommendationsPage implements OnInit {
  recommendations = signal<Recommendation[]>([]);
  loading = signal(true);

  constructor(
    private recommendationService: RecommendationService,
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
}
