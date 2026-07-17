import { Injectable, signal, computed } from '@angular/core';
import { CartItem, Product } from '../models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private items = signal<CartItem[]>(this.loadCart());

  readonly cartItems = this.items.asReadonly();
  readonly itemCount = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0));
  readonly subtotal = computed(() => this.items().reduce((sum, i) => sum + i.product.price * i.quantity, 0));

  add(product: Product, quantity = 1): void {
    this.items.update(current => {
      const existing = current.find(i => i.product.id === product.id);
      if (existing) {
        return current.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...current, { product, quantity }];
    });
    this.persist();
  }

  remove(productId: number): void {
    this.items.update(current => current.filter(i => i.product.id !== productId));
    this.persist();
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity < 1) return;
    this.items.update(current => current.map(i => i.product.id === productId ? { ...i, quantity } : i));
    this.persist();
  }

  clear(): void {
    this.items.set([]);
    this.persist();
  }

  toOrderItems(): { productId: number; quantity: number }[] {
    return this.items().map(i => ({ productId: i.product.id, quantity: i.quantity }));
  }

  private loadCart(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch {
      return [];
    }
  }

  private persist(): void {
    localStorage.setItem('cart', JSON.stringify(this.items()));
  }
}
