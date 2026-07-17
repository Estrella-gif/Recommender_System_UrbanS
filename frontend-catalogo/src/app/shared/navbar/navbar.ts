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
  templateUrl: './navbar.html',
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
