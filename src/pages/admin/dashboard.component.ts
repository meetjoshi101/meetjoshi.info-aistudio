import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="px-4 sm:px-0">
      <h2 class="text-2xl font-serif text-stone-900 mb-6">Dashboard</h2>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <!-- Projects Stats -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-stone-500 truncate">Total Projects</dt>
                  <dd class="text-3xl font-semibold text-stone-900">{{ projectStats().total }}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-stone-50 px-5 py-3">
            <div class="text-sm">
              <span class="text-amber-600 font-medium">{{ projectStats().published }}</span>
              <span class="text-stone-500"> published</span>
            </div>
          </div>
        </div>

        <!-- Blog Posts Stats -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-stone-500 truncate">Total Blog Posts</dt>
                  <dd class="text-3xl font-semibold text-stone-900">{{ blogStats().total }}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-stone-50 px-5 py-3">
            <div class="text-sm">
              <span class="text-amber-600 font-medium">{{ blogStats().published }}</span>
              <span class="text-stone-500"> published</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <h3 class="text-lg font-medium text-stone-900 mb-4">Quick Actions</h3>
            <div class="space-y-2">
              <a
                routerLink="/admin/projects/new"
                class="block w-full text-left px-3 py-2 text-sm text-amber-700 hover:bg-amber-50 rounded"
              >
                + New Project
              </a>
              <a
                routerLink="/admin/blog/new"
                class="block w-full text-left px-3 py-2 text-sm text-amber-700 hover:bg-amber-50 rounded"
              >
                + New Blog Post
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Items -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Projects -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-5 py-4 border-b border-stone-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-stone-900">Recent Projects</h3>
              <a routerLink="/admin/projects" class="text-sm text-amber-600 hover:text-amber-700">
                View all →
              </a>
            </div>
          </div>
          <div class="divide-y divide-stone-200">
            @for (project of recentProjects(); track project.id) {
              <div class="px-5 py-4 hover:bg-stone-50">
                <div class="flex items-center justify-between">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-stone-900 truncate">{{ project.title }}</p>
                    <p class="text-sm text-stone-500">{{ project.category }}</p>
                  </div>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [class.bg-green-100]="project.published"
                    [class.text-green-800]="project.published"
                    [class.bg-stone-100]="!project.published"
                    [class.text-stone-800]="!project.published">
                    {{ project.published ? 'Published' : 'Draft' }}
                  </span>
                </div>
              </div>
            } @empty {
              <div class="px-5 py-8 text-center text-stone-500">
                No projects yet
              </div>
            }
          </div>
        </div>

        <!-- Recent Blog Posts -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-5 py-4 border-b border-stone-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-stone-900">Recent Blog Posts</h3>
              <a routerLink="/admin/blog" class="text-sm text-amber-600 hover:text-amber-700">
                View all →
              </a>
            </div>
          </div>
          <div class="divide-y divide-stone-200">
            @for (post of recentBlogPosts(); track post.id) {
              <div class="px-5 py-4 hover:bg-stone-50">
                <div class="flex items-center justify-between">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-stone-900 truncate">{{ post.title }}</p>
                    <p class="text-sm text-stone-500">{{ post.date }}</p>
                  </div>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [class.bg-green-100]="post.published"
                    [class.text-green-800]="post.published"
                    [class.bg-stone-100]="!post.published"
                    [class.text-stone-800]="!post.published">
                    {{ post.published ? 'Published' : 'Draft' }}
                  </span>
                </div>
              </div>
            } @empty {
              <div class="px-5 py-8 text-center text-stone-500">
                No blog posts yet
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  projectStats = signal({ total: 0, published: 0 });
  blogStats = signal({ total: 0, published: 0 });
  recentProjects = signal<any[]>([]);
  recentBlogPosts = signal<any[]>([]);

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadStats();
  }

  private loadStats() {
    this.dataService.getAllProjects().subscribe(projects => {
      this.projectStats.set({
        total: projects.length,
        published: projects.filter(p => p.published).length
      });
      this.recentProjects.set(projects.slice(0, 5));
    });

    this.dataService.getAllBlogPosts().subscribe(posts => {
      this.blogStats.set({
        total: posts.length,
        published: posts.filter(p => p.published).length
      });
      this.recentBlogPosts.set(posts.slice(0, 5));
    });
  }
}
