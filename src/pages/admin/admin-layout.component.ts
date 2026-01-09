import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-stone-100">
      <!-- Top Navigation -->
      <nav class="bg-white shadow-sm border-b border-stone-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex">
              <div class="flex-shrink-0 flex items-center">
                <h1 class="text-xl font-serif text-stone-900">Admin Panel</h1>
              </div>
              <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a
                  routerLink="/admin"
                  routerLinkActive="border-amber-500 text-stone-900"
                  [routerLinkActiveOptions]="{exact: true}"
                  class="border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </a>
                <a
                  routerLink="/admin/projects"
                  routerLinkActive="border-amber-500 text-stone-900"
                  class="border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Projects
                </a>
                <a
                  routerLink="/admin/blog"
                  routerLinkActive="border-amber-500 text-stone-900"
                  class="border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Blog Posts
                </a>
              </div>
            </div>
            <div class="flex items-center">
              <span class="text-sm text-stone-600 mr-4">{{ user()?.email }}</span>
              <button
                (click)="onLogout()"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Page Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <router-outlet />
      </main>
    </div>
  `,
  styles: []
})
export class AdminLayoutComponent {
  user = this.authService.getUser();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogout() {
    this.authService.signOut().subscribe({
      next: () => {
        this.router.navigate(['/admin/login']);
      },
      error: (err) => {
        console.error('Logout error:', err);
      }
    });
  }
}
