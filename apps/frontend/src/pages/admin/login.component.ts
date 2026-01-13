import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-stone-100 px-4">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 class="text-center text-3xl font-serif text-stone-900">Admin Login</h2>
          <p class="mt-2 text-center text-sm text-stone-600">
            Sign in to manage your portfolio
          </p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          @if (errorMessage()) {
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {{ errorMessage() }}
            </div>
          }

          <div class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-stone-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                required
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-stone-300 placeholder-stone-400 text-stone-900 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                placeholder="admin@example.com"
              />
              @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                <p class="mt-1 text-sm text-red-600">Please enter a valid email</p>
              }
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-stone-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                formControlName="password"
                required
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-stone-300 placeholder-stone-400 text-stone-900 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
              @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                <p class="mt-1 text-sm text-red-600">Password is required</p>
              }
            </div>
          </div>

          <div>
            <button
              type="submit"
              [disabled]="loginForm.invalid || loading()"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (loading()) {
                <span class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              } @else {
                Sign in
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading.set(true);
      this.errorMessage.set('');

      const { email, password } = this.loginForm.value;

      this.authService.signIn(email, password).subscribe({
        next: ({ user, error }) => {
          this.loading.set(false);
          if (error) {
            this.errorMessage.set(error || 'Failed to sign in. Please check your credentials.');
          } else if (user) {
            this.router.navigate(['/admin']);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set('An unexpected error occurred. Please try again.');
          console.error('Login error:', err);
        }
      });
    }
  }
}
