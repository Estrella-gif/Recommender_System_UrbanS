import { Component, signal, HostListener, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  template: `
    <header class="sticky top-0 z-40 bg-paper/95 dark:bg-ink/95 backdrop-blur shadow-xl">
      <div class="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between gap-6">
        <a routerLink="/" class="font-display text-2xl tracking-tight shrink-0">
          URBAN<span class="text-lime">SOUL</span>
        </a>

        <label class="relative hidden md:block flex-1 max-w-sm">
          <span class="sr-only">Buscar</span>
          <input
            type="search"
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearch()"
            placeholder="Buscar…"
            class="w-full rounded-full border border-ink/15 dark:border-paper/15 bg-smoke dark:bg-charcoal
                   py-2 pl-10 pr-4 text-sm placeholder:text-ink/40 dark:placeholder:text-paper/40
                   focus:border-lime focus:ring-1 focus:ring-lime outline-none"
          />
          <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"/>
          </svg>
        </label>

        <nav class="hidden lg:flex items-center gap-6 font-mono text-xs uppercase tracking-wide">
          <a routerLink="/" routerLinkActive="text-lime" [routerLinkActiveOptions]="{exact: true}" class="hover:text-lime transition-colors">Home</a>
          @if (auth.isAuthenticated()) {
            <a routerLink="/recommendations" routerLinkActive="text-lime" class="hover:text-lime transition-colors">For You</a>
          }
        </nav>

        <div class="flex items-center gap-4">
          <a routerLink="/cart" class="relative h-10 w-10 grid place-items-center rounded-full hover:bg-smoke dark:hover:bg-charcoal transition-colors" aria-label="Carrito">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.94-4.693 2.436-7.152.083-.415-.242-.798-.664-.798H5.106M7.5 14.25L5.106 5.272M10.5 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm7.5 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
            </svg>
            @if (cart.itemCount()) {
              <span class="absolute -top-1 -right-1 h-5 min-w-5 px-1 grid place-items-center rounded-full bg-lime text-ink font-mono text-[10px] font-bold"
                [class.animate-bounce]="cartBumped()">
                {{ cart.itemCount() }}
              </span>
            }
          </a>

          @if (auth.isAuthenticated()) {
            <div class="relative">
              <button type="button" (click)="toggleUserMenu()"
                class="h-9 w-9 rounded-full bg-ink text-paper dark:bg-paper dark:text-ink grid place-items-center font-bold text-sm">
                {{ userInitial() }}
              </button>
              @if (userMenuOpen()) {
                <div class="fade-in absolute right-0 mt-2 w-48 rounded-xl bg-smoke dark:bg-charcoal shadow-xl overflow-hidden font-mono text-xs z-50">
                  <a routerLink="/orders" (click)="userMenuOpen.set(false)" class="block px-4 py-3 hover:bg-lime hover:text-ink transition-colors">Mis pedidos</a>
                  <button type="button" (click)="logout()" class="w-full text-left px-4 py-3 hover:bg-danger hover:text-paper transition-colors">Cerrar sesión</button>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/login" class="rounded-full bg-lime text-ink font-bold text-xs px-5 py-2.5 hover:bg-ink hover:text-paper dark:hover:bg-paper transition-colors">
              Ingresar
            </a>
          }

          <button type="button" (click)="mobileMenuOpen.set(!mobileMenuOpen())" class="lg:hidden h-10 w-10 grid place-items-center" aria-label="Menú">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"/>
            </svg>
          </button>
        </div>
      </div>

      @if (mobileMenuOpen()) {
        <div class="lg:hidden fixed inset-0 z-50" (click)="mobileMenuOpen.set(false)">
          <div class="absolute inset-0 bg-ink/60"></div>
          <div class="absolute right-0 top-0 h-full w-72 bg-paper dark:bg-ink p-6 fade-in" (click)="$event.stopPropagation()">
            <div class="flex justify-between items-center mb-8">
              <span class="font-display text-xl">MENÚ</span>
              <button type="button" (click)="mobileMenuOpen.set(false)" aria-label="Cerrar menú">✕</button>
            </div>
            <label class="relative block mb-6">
              <input type="search" [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" placeholder="Buscar…"
                class="w-full rounded-full border border-ink/15 dark:border-paper/15 bg-smoke dark:bg-charcoal py-2.5 pl-4 pr-4 text-sm outline-none focus:border-lime"/>
            </label>
            <nav class="flex flex-col gap-1 font-mono text-sm uppercase">
              <a routerLink="/" (click)="mobileMenuOpen.set(false)" class="py-3 border-b border-ink/10 dark:border-paper/10">Home</a>
              @if (auth.isAuthenticated()) {
                <a routerLink="/recommendations" (click)="mobileMenuOpen.set(false)" class="py-3 border-b border-ink/10 dark:border-paper/10">For You</a>
                <a routerLink="/orders" (click)="mobileMenuOpen.set(false)" class="py-3 border-b border-ink/10 dark:border-paper/10">Mis pedidos</a>
                <button type="button" (click)="logout(); mobileMenuOpen.set(false)" class="py-3 text-left text-danger">Cerrar sesión</button>
              } @else {
                <a routerLink="/login" (click)="mobileMenuOpen.set(false)" class="py-3 text-lime font-bold">Ingresar</a>
              }
            </nav>
          </div>
        </div>
      }
    </header>
  `,
})
export class Navbar {
  private router = inject(Router);
  searchTerm = '';
  mobileMenuOpen = signal(false);
  userMenuOpen = signal(false);
  cartBumped = signal(false);

  constructor(
    readonly auth: AuthService,
    readonly cart: CartService,
  ) {}

  userInitial(): string {
    return 'U';
  }

  onSearch(): void {
    this.router.navigate(['/'], { queryParams: { q: this.searchTerm || undefined } });
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (this.userMenuOpen() && !target.closest('.relative')) {
      this.userMenuOpen.set(false);
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
