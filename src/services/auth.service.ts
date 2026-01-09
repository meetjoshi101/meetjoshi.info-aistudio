import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { Observable, from, map, catchError, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  private currentSession = signal<Session | null>(null);

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private async initializeAuth() {
    const supabase = this.supabaseService.client;

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    this.currentSession.set(session);
    this.currentUser.set(session?.user ?? null);

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      this.currentSession.set(session);
      this.currentUser.set(session?.user ?? null);

      if (event === 'SIGNED_OUT') {
        this.router.navigate(['/admin/login']);
      }
    });
  }

  signIn(email: string, password: string): Observable<{ user: User | null; error: AuthError | null }> {
    const supabase = this.supabaseService.client;

    return from(
      supabase.auth.signInWithPassword({ email, password })
    ).pipe(
      map(({ data, error }) => ({
        user: data.user,
        error: error
      })),
      tap(({ user, error }) => {
        if (user && !error) {
          this.currentUser.set(user);
          this.router.navigate(['/admin']);
        }
      }),
      catchError(error => {
        console.error('Sign in error:', error);
        return of({ user: null, error });
      })
    );
  }

  signUp(email: string, password: string): Observable<{ user: User | null; error: AuthError | null }> {
    const supabase = this.supabaseService.client;

    return from(
      supabase.auth.signUp({ email, password })
    ).pipe(
      map(({ data, error }) => ({
        user: data.user,
        error: error
      })),
      catchError(error => {
        console.error('Sign up error:', error);
        return of({ user: null, error });
      })
    );
  }

  signOut(): Observable<{ error: AuthError | null }> {
    const supabase = this.supabaseService.client;

    return from(supabase.auth.signOut()).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.currentSession.set(null);
      }),
      map(({ error }) => ({ error })),
      catchError(error => {
        console.error('Sign out error:', error);
        return of({ error });
      })
    );
  }

  getUser() {
    return this.currentUser.asReadonly();
  }

  getSession() {
    return this.currentSession.asReadonly();
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  async checkAuth(): Promise<boolean> {
    const supabase = this.supabaseService.client;
    const { data: { session } } = await supabase.auth.getSession();
    return session !== null;
  }
}
