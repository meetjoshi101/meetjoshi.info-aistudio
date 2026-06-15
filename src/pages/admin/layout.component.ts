import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-layout',
  template: `
    <div class="min-h-screen bg-stone-100 flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-stone-900 text-stone-300 flex flex-col">
        <div class="p-8 border-b border-stone-800">
          <h2 class="text-xl font-serif text-white tracking-widest uppercase font-bold">Workspace</h2>
          <div class="text-xs font-mono text-stone-500 mt-2 truncate">{{ auth.user()?.email }}</div>
        </div>

        <nav class="flex-1 py-8 px-4 flex flex-col gap-2 font-mono text-sm">
          <a routerLink="/admin/projects" routerLinkActive="bg-stone-800 text-white" class="flex items-center gap-3 px-4 py-3 rounded hover:bg-stone-800 transition-colors">
            <mat-icon class="text-stone-500">work</mat-icon>
            Projects
          </a>
          <a routerLink="/admin/blog" routerLinkActive="bg-stone-800 text-white" class="flex items-center gap-3 px-4 py-3 rounded hover:bg-stone-800 transition-colors">
            <mat-icon class="text-stone-500">article</mat-icon>
            Blog Posts
          </a>
          <a routerLink="/admin/inquiries" routerLinkActive="bg-stone-800 text-white" class="flex items-center gap-3 px-4 py-3 rounded hover:bg-stone-800 transition-colors">
            <mat-icon class="text-stone-500">mail</mat-icon>
            Inquiries
          </a>
          <a routerLink="/admin/content" routerLinkActive="bg-stone-800 text-white" class="flex items-center gap-3 px-4 py-3 rounded hover:bg-stone-800 transition-colors">
            <mat-icon class="text-stone-500">settings</mat-icon>
            Site Content
          </a>
        </nav>

        <div class="p-4 border-t border-stone-800">
          <a routerLink="/" class="flex flex-col items-center justify-center p-4 bg-stone-800 rounded hover:bg-stone-700 transition-colors text-white text-xs font-mono mb-2 text-center gap-2">
            <mat-icon>public</mat-icon>
            View Public Site
          </a>
          <button (click)="auth.logout()" class="w-full py-3 text-red-400 hover:bg-red-400/10 rounded font-mono text-xs uppercase tracking-widest transition-colors flex justify-center items-center gap-2">
            <mat-icon class="text-[18px]">logout</mat-icon> Sign Out
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule]
})
export class AdminLayoutComponent {
  public auth = inject(AuthService);
}
