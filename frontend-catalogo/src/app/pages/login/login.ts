import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
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
