import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  template: `
    <div class="min-h-[70vh] flex items-center justify-center p-8">
      <div class="max-w-md w-full bg-stone-50 border border-stone-200 p-12 text-center rounded">
        <h1 class="text-4xl font-serif font-black text-stone-900 mb-4 tracking-tighter">Admin Gateway</h1>
        <p class="text-stone-500 mb-12 font-mono text-sm leading-relaxed">
          Authentication required. Access is strictly limited to authorized personnel.
        </p>

        @if (!auth.ready()) {
          <div class="animate-pulse bg-stone-200 h-12 w-full rounded"></div>
        } @else if (!auth.user()) {
          <button (click)="login()" class="w-full bg-stone-900 text-stone-50 py-4 font-mono text-sm uppercase tracking-widest hover:bg-gold-500 hover:text-stone-900 transition-colors">
            Login with Google
          </button>
        } @else if (!auth.isAdmin()) {
          <div class="text-red-500 border border-red-200 bg-red-50 p-4 font-mono text-xs mb-8">
            Access Denied. Your account ({{auth.user()?.email}}) is not authorized for administrative action.
          </div>
          <button (click)="auth.logout()" class="w-full bg-stone-900 text-stone-50 py-4 font-mono text-sm uppercase tracking-widest hover:bg-gold-500 hover:text-stone-900 transition-colors">
            Sign Out
          </button>
        } @else {
          <div class="text-emerald-600 font-mono text-sm mb-8 flex flex-col gap-2">
            <span>Identity Verified.</span>
            <span>Welcome, {{auth.user()?.email}}</span>
          </div>
          <button (click)="goToAdmin()" class="w-full bg-stone-900 text-stone-50 py-4 font-mono text-sm uppercase tracking-widest hover:bg-gold-500 hover:text-stone-900 transition-colors">
            Enter Admin Panel
          </button>
        }
      </div>
    </div>
  `
})
export class LoginComponent {
  public auth = inject(AuthService);
  private router = inject(Router);

  async login() {
    await this.auth.login();
    if(this.auth.isAdmin()) {
      this.router.navigate(['/admin']);
    }
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }
}
