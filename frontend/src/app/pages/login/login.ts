import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgClass],
  template: `
    <div class="min-h-[calc(100vh-4rem)] flex">
      <div class="hidden lg:flex lg:w-1/2 bg-zinc-900 items-center justify-center p-16">
        <div class="text-center">
          <h1 class="text-6xl font-black text-white mb-4">Urban<span class="text-lime-400">Soul</span></h1>
          <p class="text-zinc-400 text-lg">Your style, your rules.</p>
        </div>
      </div>

      <div class="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div class="w-full max-w-md">
          <div class="flex mb-8 bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-1">
            <button (click)="mode.set('login')" [ngClass]="mode() === 'login' ? 'bg-white dark:bg-zinc-700 shadow-sm' : ''"
              class="flex-1 py-3 rounded-xl text-sm font-medium transition-all">Sign in</button>
            <button (click)="mode.set('register')" [ngClass]="mode() === 'register' ? 'bg-white dark:bg-zinc-700 shadow-sm' : ''"
              class="flex-1 py-3 rounded-xl text-sm font-medium transition-all">Create account</button>
          </div>

          <form (ngSubmit)="submit()" #f="ngForm" class="space-y-4">
            <input [(ngModel)]="email" name="email" type="email" placeholder="Email" required
              class="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-lime-400 transition-colors" />
            <input [(ngModel)]="password" name="password" type="password" placeholder="Password" required minlength="8"
              class="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-lime-400 transition-colors" />

            @if (mode() === 'register') {
              <input [(ngModel)]="firstName" name="firstName" type="text" placeholder="First name"
                class="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-lime-400 transition-colors" />
              <input [(ngModel)]="lastName" name="lastName" type="text" placeholder="Last name"
                class="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-lime-400 transition-colors" />
            }

            @if (error()) {
              <p class="text-red-500 text-sm">{{ error() }}</p>
            }

            <button type="submit" [disabled]="!f.valid || loading()"
              class="w-full py-3 bg-lime-400 text-black font-semibold rounded-xl hover:bg-lime-300 disabled:opacity-40 transition-colors">
              {{ loading() ? 'Loading...' : mode() === 'login' ? 'Sign in' : 'Create account' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginPage {
  mode = signal<'login' | 'register'>('login');
  email = '';
  password = '';
  firstName = '';
  lastName = '';
  loading = signal(false);
  error = signal('');

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  submit(): void {
    this.loading.set(true);
    this.error.set('');
    const req = this.mode() === 'login'
      ? this.authService.login(this.email, this.password)
      : this.authService.register(this.email, this.password, this.firstName, this.lastName);

    req.subscribe({
      next: (res) => {
        this.authService.saveToken(res);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error.set(err.error?.detail || 'Authentication failed');
        this.loading.set(false);
      },
    });
  }
}
