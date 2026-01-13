import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, catchError, of, tap } from 'rxjs';
import { ApiService } from './api.service';
import { SignInRequest, SignInResponse } from '@meetjoshi/shared';

export interface User {
  id: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiService = inject(ApiService);
  private router = inject(Router);

  private currentUser = signal<User | null>(null);
  private accessToken = signal<string | null>(null);

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    // Check for stored token
    const token = localStorage.getItem('access_token');

    if (token) {
      this.accessToken.set(token);
      // Verify session with backend
      this.verifySession().subscribe();
    }
  }

  private verifySession(): Observable<boolean> {
    return this.apiService.get<{ session: { user: User } | null }>('/auth/session', true).pipe(
      map(response => {
        if (response.session?.user) {
          this.currentUser.set(response.session.user);
          return true;
        }
        this.clearAuth();
        return false;
      }),
      catchError(() => {
        this.clearAuth();
        return of(false);
      })
    );
  }

  signIn(email: string, password: string): Observable<{ user: User | null; error: string | null }> {
    const request: SignInRequest = { email, password };

    return this.apiService.post<SignInResponse>('/auth/signin', request).pipe(
      map(response => {
        if (response.session && response.user) {
          // Store tokens
          localStorage.setItem('access_token', response.session.access_token);
          localStorage.setItem('refresh_token', response.session.refresh_token);

          this.accessToken.set(response.session.access_token);
          this.currentUser.set(response.user);

          this.router.navigate(['/admin']);

          return { user: response.user, error: null };
        }

        return { user: null, error: response.error || 'Sign in failed' };
      }),
      catchError(error => {
        console.error('Sign in error:', error);
        return of({ user: null, error: error.error?.error || 'Sign in failed' });
      })
    );
  }

  signOut(): Observable<{ error: string | null }> {
    return this.apiService.post<{ success: boolean }>('/auth/signout', {}, true).pipe(
      tap(() => {
        this.clearAuth();
        this.router.navigate(['/admin/login']);
      }),
      map(() => ({ error: null })),
      catchError(error => {
        console.error('Sign out error:', error);
        this.clearAuth();
        return of({ error: null });
      })
    );
  }

  private clearAuth(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.accessToken.set(null);
    this.currentUser.set(null);
  }

  getUser() {
    return this.currentUser.asReadonly();
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null && this.accessToken() !== null;
  }

  async checkAuth(): Promise<boolean> {
    if (!this.accessToken()) {
      return false;
    }

    return new Promise((resolve) => {
      this.verifySession().subscribe(isValid => resolve(isValid));
    });
  }
}
