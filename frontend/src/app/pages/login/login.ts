import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <main class="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-paper dark:bg-ink text-ink dark:text-paper">
      <div class="relative hidden lg:block overflow-hidden">
        <img src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=1200" alt="" class="absolute inset-0 h-full w-full object-cover" />
        <div class="absolute inset-0 bg-ink/70"></div>
        <div class="relative h-full flex flex-col justify-between p-12">
          <a routerLink="/" class="font-display text-2xl text-paper">URBAN<span class="text-lime">SOUL</span></a>
          <div>
            <p class="font-display text-paper text-6xl leading-[0.9]">JOIN<br/>THE<br/>MOVEMENT</p>
            <p class="mt-4 text-smoke/80 text-sm max-w-xs">Acceso anticipado a drops, recomendaciones curadas y seguimiento de tus pedidos.</p>
          </div>
          <p class="font-mono text-xs text-smoke/50">© 2026 UrbanSoul</p>
        </div>
      </div>

      <div class="flex items-center justify-center p-6 sm:p-12">
        <div class="w-full max-w-sm">
          <a routerLink="/" class="lg:hidden font-display text-xl mb-8 inline-block">URBAN<span class="text-lime">SOUL</span></a>

          <div class="relative flex mb-8 rounded-full bg-smoke dark:bg-charcoal p-1">
            <button type="button" (click)="activeTab.set('login')"
              class="flex-1 relative z-10 py-2.5 rounded-full font-mono text-xs font-bold uppercase transition-colors"
              [class.opacity-50]="activeTab() !== 'login'">Iniciar sesión</button>
            <button type="button" (click)="activeTab.set('register')"
              class="flex-1 relative z-10 py-2.5 rounded-full font-mono text-xs font-bold uppercase transition-colors"
              [class.opacity-50]="activeTab() !== 'register'">Crear cuenta</button>
            <div class="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-lime transition-transform duration-300"
              [class.translate-x-full]="activeTab() === 'register'" style="left: 4px"></div>
          </div>

          @if (error()) {
            <div class="mb-6 rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger font-mono">{{ error() }}</div>
          }

          @if (activeTab() === 'login') {
            <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-4 fade-in">
              <div>
                <label class="block text-xs font-mono uppercase opacity-60 mb-1.5">Email</label>
                <div class="relative">
                  <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0-.966.784-1.75 1.75-1.75h16c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0119.994 19H4.006a1.75 1.75 0 01-1.75-1.75V6.75zm1.5.311v9.939c0 .138.112.25.25.25h16a.25.25 0 00.25-.25V7.06l-8.05 5.367a.75.75 0 01-.832 0L3.75 7.061z"/>
                  </svg>
                  <input formControlName="email" type="email" placeholder="email@example.com"
                    class="w-full rounded-lg border border-ink/15 dark:border-paper/15 bg-smoke dark:bg-charcoal py-2.5 pl-10 pr-4 text-sm focus:border-lime focus:ring-1 focus:ring-lime outline-none" />
                </div>
              </div>
              <div>
                <label class="block text-xs font-mono uppercase opacity-60 mb-1.5">Contraseña</label>
                <div class="relative">
                  <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                  </svg>
                  <input formControlName="password" type="password" placeholder="••••••••"
                    class="w-full rounded-lg border border-ink/15 dark:border-paper/15 bg-smoke dark:bg-charcoal py-2.5 pl-10 pr-4 text-sm focus:border-lime focus:ring-1 focus:ring-lime outline-none" />
                </div>
              </div>
              <button type="submit" [disabled]="loginForm.invalid || submitting()"
                class="w-full rounded-full bg-lime text-ink font-bold py-3 hover:bg-ink hover:text-paper dark:hover:bg-paper transition-colors disabled:opacity-40">
                {{ submitting() ? 'Ingresando…' : 'Iniciar sesión' }}
              </button>
            </form>
          }

          @if (activeTab() === 'register') {
            <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="space-y-4 fade-in">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-mono uppercase opacity-60 mb-1.5">Nombre</label>
                  <input formControlName="firstName" type="text" placeholder="Tu nombre"
                    class="w-full rounded-lg border border-ink/15 dark:border-paper/15 bg-smoke dark:bg-charcoal py-2.5 px-4 text-sm focus:border-lime focus:ring-1 focus:ring-lime outline-none" />
                </div>
                <div>
                  <label class="block text-xs font-mono uppercase opacity-60 mb-1.5">Apellido</label>
                  <input formControlName="lastName" type="text" placeholder="Tu apellido"
                    class="w-full rounded-lg border border-ink/15 dark:border-paper/15 bg-smoke dark:bg-charcoal py-2.5 px-4 text-sm focus:border-lime focus:ring-1 focus:ring-lime outline-none" />
                </div>
              </div>
              <div>
                <label class="block text-xs font-mono uppercase opacity-60 mb-1.5">Email</label>
                <input formControlName="email" type="email" placeholder="email@example.com"
                  class="w-full rounded-lg border border-ink/15 dark:border-paper/15 bg-smoke dark:bg-charcoal py-2.5 px-4 text-sm focus:border-lime focus:ring-1 focus:ring-lime outline-none" />
              </div>
              <div>
                <label class="block text-xs font-mono uppercase opacity-60 mb-1.5">Contraseña</label>
                <input formControlName="password" type="password" placeholder="Mínimo 8 caracteres"
                  class="w-full rounded-lg border border-ink/15 dark:border-paper/15 bg-smoke dark:bg-charcoal py-2.5 px-4 text-sm focus:border-lime focus:ring-1 focus:ring-lime outline-none" />
              </div>
              <button type="submit" [disabled]="registerForm.invalid || submitting()"
                class="w-full rounded-full bg-lime text-ink font-bold py-3 hover:bg-ink hover:text-paper dark:hover:bg-paper transition-colors disabled:opacity-40">
                {{ submitting() ? 'Creando cuenta…' : 'Crear cuenta' }}
              </button>
            </form>
          }
        </div>
      </div>
    </main>
  `,
})
export class LoginPage {
  activeTab = signal<'login' | 'register'>('login');
  submitting = signal(false);
  error = signal('');
  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      firstName: [''],
      lastName: [''],
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;
    this.submitting.set(true);
    this.error.set('');
    this.authService.login(this.loginForm.value.email, this.loginForm.value.password).subscribe({
      next: (res) => {
        this.authService.saveToken(res);
        this.router.navigate(['/']);
      },
      error: () => { this.error.set('Email o contraseña inválidos.'); this.submitting.set(false); },
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) return;
    this.submitting.set(true);
    this.error.set('');
    this.authService.register(
      this.registerForm.value.email, this.registerForm.value.password,
      this.registerForm.value.firstName, this.registerForm.value.lastName,
    ).subscribe({
      next: (res) => {
        this.authService.saveToken(res);
        this.router.navigate(['/']);
      },
      error: (err) => { this.error.set(err.error?.detail || 'Error al crear cuenta.'); this.submitting.set(false); },
    });
  }
}
