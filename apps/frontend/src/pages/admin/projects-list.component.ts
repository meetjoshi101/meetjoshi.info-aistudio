import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Project } from '@meetjoshi/shared';
import { from } from 'rxjs';

@Component({
  selector: 'app-admin-projects-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="px-4 sm:px-0">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-serif text-stone-900">Projects</h2>
        <a
          routerLink="/admin/projects/new"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        >
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </a>
      </div>

      @if (loading()) {
        <div class="bg-white shadow rounded-lg p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          <p class="mt-2 text-stone-600">Loading projects...</p>
        </div>
      } @else if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {{ error() }}
        </div>
      } @else {
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <table class="min-w-full divide-y divide-stone-200">
            <thead class="bg-stone-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Project
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Year
                </th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-stone-200">
              @for (project of projects(); track project.id) {
                <tr class="hover:bg-stone-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <img class="h-10 w-10 rounded object-cover" [src]="project.imageUrl" [alt]="project.title">
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-stone-900">{{ project.title }}</div>
                        <div class="text-sm text-stone-500">{{ project.client }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                      {{ project.category }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      [class.bg-green-100]="project.published"
                      [class.text-green-800]="project.published"
                      [class.bg-stone-100]="!project.published"
                      [class.text-stone-800]="!project.published">
                      {{ project.published ? 'Published' : 'Draft' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                    {{ project.year }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      [routerLink]="['/admin/projects/edit', project.id]"
                      class="text-amber-600 hover:text-amber-900 mr-4"
                    >
                      Edit
                    </a>
                    <button
                      (click)="confirmDelete(project)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-6 py-8 text-center text-stone-500">
                    No projects yet. Create your first project!
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (deleteConfirm()) {
        <div class="fixed inset-0 bg-stone-500 bg-opacity-75 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-medium text-stone-900 mb-4">Delete Project</h3>
            <p class="text-sm text-stone-500 mb-6">
              Are you sure you want to delete "{{ deleteConfirm()?.title }}"? This action cannot be undone.
            </p>
            <div class="flex justify-end space-x-3">
              <button
                (click)="deleteConfirm.set(null)"
                class="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                (click)="deleteProject()"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class ProjectsListComponent implements OnInit {
  projects = signal<Project[]>([]);
  loading = signal(true);
  error = signal('');
  deleteConfirm = signal<Project | null>(null);

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadProjects();
  }

  private loadProjects() {
    this.loading.set(true);
    this.dataService.getAllProjects().subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load projects');
        this.loading.set(false);
        console.error('Error loading projects:', err);
      }
    });
  }

  confirmDelete(project: Project) {
    this.deleteConfirm.set(project);
  }

  deleteProject() {
    const project = this.deleteConfirm();
    if (!project) return;

    from(this.dataService.deleteProject(project.id)).subscribe({
      next: () => {
        this.projects.update(projects => projects.filter(p => p.id !== project.id));
        this.deleteConfirm.set(null);
      },
      error: (err) => {
        this.error.set('Failed to delete project');
        this.deleteConfirm.set(null);
        console.error('Error deleting project:', err);
      }
    });
  }
}
