import { Component, inject } from '@angular/core';
import { DataService, Project } from '../../services/data.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-projects',
  template: `
    <div class="p-12 max-w-6xl mx-auto">
      <header class="flex justify-between items-end mb-12 border-b border-stone-200 pb-8">
        <div>
          <h1 class="text-4xl font-serif font-bold text-stone-900 tracking-tight">Project Management</h1>
          <p class="text-stone-500 font-mono text-sm mt-2">Manage portfolio entries and case studies</p>
        </div>
        <button (click)="openEditor()" class="bg-stone-900 text-stone-50 px-6 py-3 font-mono text-sm uppercase tracking-widest hover:bg-gold-500 hover:text-stone-900 transition-colors flex items-center gap-2">
          <mat-icon>add</mat-icon> New Project
        </button>
      </header>

      @if (isEditing) {
        <div class="bg-white p-8 border border-stone-200 rounded shadow-sm mb-12">
           <h2 class="text-xl font-serif font-bold mb-6 border-b border-stone-100 pb-4">{{ editingId ? 'Edit Project' : 'Create Project' }}</h2>
           
           <div class="grid grid-cols-2 gap-6 mb-6">
             <div>
               <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Title *</label>
               <input [(ngModel)]="draft.title" class="w-full border border-stone-200 p-3 bg-stone-50 focus:outline-none focus:border-stone-900 font-sans">
             </div>
             <div>
               <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Category *</label>
               <input [(ngModel)]="draft.category" class="w-full border border-stone-200 p-3 bg-stone-50 focus:outline-none focus:border-stone-900 font-sans">
             </div>
             <div>
               <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Slug/ID * (alphanumeric, no spaces)</label>
               <input [(ngModel)]="draft.id" [disabled]="!!editingId" class="w-full border border-stone-200 p-3 bg-stone-50 focus:outline-none disabled:opacity-50 font-mono">
             </div>
             <div>
               <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Image URL *</label>
               <input [(ngModel)]="draft.imageUrl" class="w-full border border-stone-200 p-3 bg-stone-50 focus:outline-none focus:border-stone-900 font-sans">
             </div>
           </div>

           <div class="mb-6">
             <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Short Description *</label>
             <textarea [(ngModel)]="draft.description" rows="3" class="w-full border border-stone-200 p-3 bg-stone-50 focus:outline-none focus:border-stone-900 font-sans"></textarea>
           </div>

           <div class="flex justify-end gap-4 mt-8 pt-4 border-t border-stone-100">
             <button (click)="cancelEdit()" class="px-6 py-2 border border-stone-200 text-stone-600 font-mono text-sm hover:bg-stone-50 transition-colors">Cancel</button>
             <button (click)="saveProject()" class="px-6 py-2 bg-stone-900 text-white font-mono text-sm hover:bg-gold-500 hover:text-stone-900 transition-colors flex items-center gap-2"><mat-icon>save</mat-icon> Save Project</button>
           </div>
        </div>
      }

      <div class="grid grid-cols-1 gap-4">
        @for (project of projects(); track project.id) {
          <div class="bg-white border border-stone-200 p-6 flex justify-between items-center group hover:border-gold-500 transition-colors">
             <div class="flex items-center gap-6">
               <div class="w-24 h-16 bg-stone-100 overflow-hidden rounded-sm flex-shrink-0">
                  <img [src]="project.imageUrl" class="w-full h-full object-cover">
               </div>
               <div>
                 <div class="flex items-center gap-3 mb-1">
                   <h3 class="font-serif font-bold text-lg text-stone-900">{{ project.title }}</h3>
                   <span class="text-xs font-mono bg-stone-100 px-2 py-0.5 text-stone-500 rounded-sm">{{ project.category }}</span>
                 </div>
                 <div class="text-xs font-mono text-stone-400">
                   ID: {{ project.id }} &middot; Created: {{ project.createdAt?.toDate() | date:'shortDate' }}
                 </div>
               </div>
             </div>
             
             <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button (click)="editProject(project)" class="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors" title="Edit">
                 <mat-icon>edit</mat-icon>
               </button>
               <button (click)="deleteProject(project.id)" class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                 <mat-icon>delete</mat-icon>
               </button>
             </div>
          </div>
        } @empty {
          <div class="p-12 text-center text-stone-400 font-mono bg-stone-50/50 border border-stone-200 border-dashed rounded">
            No projects found. Click "New Project" to add one.
          </div>
        }
      </div>
    </div>
  `,
  imports: [FormsModule, MatIconModule, DatePipe]
})
export class AdminProjectsComponent {
  private dataService = inject(DataService);
  public projects = toSignal(this.dataService.getProjects(), { initialValue: [] });

  public isEditing = false;
  public editingId: string | null = null;
  public draft: Partial<Project> = {};

  openEditor() {
    this.isEditing = true;
    this.editingId = null;
    this.draft = {
      id: '',
      title: '',
      category: '',
      description: '',
      imageUrl: '',
      technologies: []
    };
  }

  editProject(project: Project) {
    this.isEditing = true;
    this.editingId = project.id;
    this.draft = { ...project };
  }

  cancelEdit() {
    this.isEditing = false;
    this.editingId = null;
    this.draft = {};
  }

  async saveProject() {
    if (!this.draft.id || !this.draft.title || !this.draft.category || !this.draft.description || !this.draft.imageUrl) {
      alert("Please fill all required fields.");
      return;
    }

    if (this.editingId) {
      const { id, createdAt, updatedAt, ...rest } = this.draft;
      await this.dataService.updateProject(this.editingId, rest);
    } else {
      await this.dataService.addProject(this.draft as Project);
    }
    this.cancelEdit();
  }

  async deleteProject(id: string) {
    if(confirm(`Are you sure you want to delete project ${id}?`)){
      await this.dataService.deleteProject(id);
    }
  }
}
