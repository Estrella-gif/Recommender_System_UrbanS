import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800">
      <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <a routerLink="/" class="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
          Urban<span class="text-lime-400">Soul</span>
        </a>

        <div class="hidden md:flex items-center gap-6 text-sm font-medium">
          <a routerLink="/" class="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Home</a>
          @if (auth.isAuthenticated()) {
            <a routerLink="/recommendations" class="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">For You</a>
          }
          <a routerLink="/cart" class="relative text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            Cart
            @if (cart.itemCount()) {
              <span class="absolute -top-2 -right-4 bg-lime-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {{ cart.itemCount() }}
              </span>
            }
          </a>
        </div>

        <div class="flex items-center gap-3">
          @if (auth.isAuthenticated()) {
            <a routerLink="/orders" class="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Orders</a>
            <button (click)="logout()" class="text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              Log out
            </button>
          } @else {
            <a routerLink="/login" class="text-sm bg-lime-400 text-black font-semibold px-5 py-2 rounded-full hover:bg-lime-300 transition-colors">
              Sign in
            </a>
          }
        </div>
      </div>
    </nav>
  `,
})
export class Navbar {
  constructor(
    readonly auth: AuthService,
    readonly cart: CartService,
  ) {}

  logout(): void {
    this.auth.logout();
    window.location.href = '/';
  }
}
