import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './checkout.html',
})
export class CheckoutPage {
  shippingForm: FormGroup;
  submitting = signal(false);
  error = signal('');
  summaryExpanded = signal(true);

  constructor(
    private fb: FormBuilder,
    readonly cart: CartService,
    private orderService: OrderService,
    private router: Router,
  ) {
    this.shippingForm = this.fb.group({
      fullName: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      phone: [''],
    });
  }

  onSubmit(): void {
    if (this.shippingForm.invalid) return;
    this.submitting.set(true);
    this.error.set('');
    this.orderService.create(this.cart.toOrderItems()).subscribe({
      next: (order) => {
        this.cart.clear();
        this.router.navigate(['/orders', order.id]);
      },
      error: (err) => {
        this.error.set(err.error?.detail || 'Error al crear el pedido.');
        this.submitting.set(false);
      },
    });
  }
}
