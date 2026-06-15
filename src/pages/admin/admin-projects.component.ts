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
        <div class="bg-white border border-stone-200 rounded-xl shadow-sm mb-12 overflow-hidden">
           <div class="p-6 md:p-8 bg-stone-50 border-b border-stone-200">
             <h2 class="text-xl font-serif font-bold text-stone-900">{{ editingId ? 'Edit Project' : 'Create Project' }}</h2>
             <p class="text-sm font-mono text-stone-500 mt-1">Fill in the project details below. Required fields are marked with an asterisk (*).</p>
           </div>
           
           <div class="p-6 md:p-8 space-y-12">
             <!-- Basic Information -->
             <section>
               <h3 class="text-sm font-bold font-sans uppercase tracking-widest text-stone-900 mb-6 flex items-center gap-2">
                 <mat-icon class="text-gold-500 text-sm w-4 h-4" style="font-size: 16px;">info</mat-icon> Core Details
               </h3>
               <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div>
                   <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Title *</label>
                   <input [(ngModel)]="draft.title" class="w-full border border-stone-200 p-3 bg-stone-50 focus:outline-none focus:border-stone-900 font-sans rounded-md">
                 </div>
                 <div>
                   <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Category/Service *</label>
                   <input [(ngModel)]="draft.category" class="w-full border border-stone-200 p-3 bg-stone-50 focus:outline-none focus:border-stone-900 font-sans rounded-md">
                 </div>
                 <div>
                   <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Slug/ID *</label>
                   <input [(ngModel)]="draft.id" [disabled]="!!editingId" class="w-full border border-stone-200 p-3 bg-stone-50 focus:outline-none disabled:opacity-50 font-mono rounded-md">
                 </div>
                 <div class="md:col-span-2">
                   <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Image URL *</label>
                   <input [(ngModel)]="draft.imageUrl" class="w-full border border-stone-200 p-3 bg-stone-50 focus:outline-none focus:border-stone-900 font-sans rounded-md">
                 </div>
                 <div>
                   <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">External Link</label>
                   <input [(ngModel)]="draft.link" class="w-full border border-stone-200 p-3 bg-stone-50 focus:outline-none focus:border-stone-900 font-sans rounded-md">
                 </div>
               </div>
             </section>

             <hr class="border-stone-100">

             <!-- Project Metadata -->
             <section>
               <h3 class="text-sm font-bold font-sans uppercase tracking-widest text-stone-900 mb-6 flex items-center gap-2">
                 <mat-icon class="text-gold-500 text-sm w-4 h-4" style="font-size: 16px;">work</mat-icon> Meta Data
               </h3>
               <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div>
                   <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Client</label>
                   <input [(ngModel)]="draft.client" class="w-full border border-stone-200 p-3 bg-stone-50 focus:outline-none focus:border-stone-900 font-sans rounded-md">
                 </div>
                 <div>
                   <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Industry</label>
                   <input [(ngModel)]="draft.industry" class="w-full border border-stone-200 p-3 bg-stone-50 focus:outline-none focus:border-stone-900 font-sans rounded-md">
                 </div>
                 <div>
                   <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Role</label>
                   <input [(ngModel)]="draft.role" class="w-full border border-stone-200 p-3 bg-stone-50 focus:outline-none focus:border-stone-900 font-sans rounded-md">
                 </div>
                 <div>
                   <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Duration</label>
                   <input [(ngModel)]="draft.duration" class="w-full border border-stone-200 p-3 bg-stone-50 focus:outline-none focus:border-stone-900 font-sans rounded-md">
                 </div>
               </div>
             </section>

             <hr class="border-stone-100">

             <!-- Summary & Overview -->
             <section>
               <h3 class="text-sm font-bold font-sans uppercase tracking-widest text-stone-900 mb-6 flex items-center gap-2">
                 <mat-icon class="text-gold-500 text-sm w-4 h-4" style="font-size: 16px;">article</mat-icon> Summary & Overview
               </h3>
               <div class="space-y-6">
                 <div>
                   <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Short Description *</label>
                   <textarea [(ngModel)]="draft.description" rows="2" class="w-full border border-stone-200 p-3 bg-stone-50 focus:outline-none focus:border-stone-900 font-sans rounded-md"></textarea>
                 </div>
                 <div>
                   <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Detailed Overview</label>
                   <textarea [(ngModel)]="draft.overview" rows="4" class="w-full border border-stone-200 p-3 bg-stone-50 focus:outline-none focus:border-stone-900 font-sans rounded-md"></textarea>
                 </div>
                 <div>
                   <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Key Learning / Impact Quote</label>
                   <textarea [(ngModel)]="draft.keyLearning" rows="2" class="w-full border border-stone-200 p-3 bg-stone-50 focus:outline-none focus:border-stone-900 font-sans text-lg font-serif rounded-md placeholder-stone-400" placeholder="A standout quote or learning..."></textarea>
                 </div>
               </div>
             </section>

             <hr class="border-stone-100">

             <!-- Deep Dive / Case Study Details -->
             <section>
               <h3 class="text-sm font-bold font-sans uppercase tracking-widest text-stone-900 mb-6 flex items-center gap-2">
                 <mat-icon class="text-gold-500 text-sm w-4 h-4" style="font-size: 16px;">library_books</mat-icon> Deep Dive Details
               </h3>
               
               <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <!-- Problem -->
                 <div class="p-5 border border-stone-200 rounded-lg bg-stone-50/50">
                   <h4 class="text-base font-serif font-bold text-stone-900 mb-4">1. The Problem</h4>
                   <div class="space-y-4">
                     <div>
                       <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Story/Text</label>
                       <textarea [(ngModel)]="draft.challenge" rows="3" class="w-full border border-stone-200 p-3 bg-white focus:outline-none focus:border-stone-900 font-sans rounded-md"></textarea>
                     </div>
                     <div>
                       <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Bullet Points (Comma separated)</label>
                       <input [ngModel]="draft.problemList?.join(', ')" (ngModelChange)="updateList('problemList', $event)" class="w-full border border-stone-200 p-3 bg-white focus:outline-none focus:border-stone-900 font-sans rounded-md">
                     </div>
                   </div>
                 </div>

                 <!-- Solution -->
                 <div class="p-5 border border-stone-200 rounded-lg bg-stone-50/50">
                   <h4 class="text-base font-serif font-bold text-stone-900 mb-4">2. The Solution</h4>
                   <div class="space-y-4">
                     <div>
                       <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Story/Text</label>
                       <textarea [(ngModel)]="draft.solution" rows="3" class="w-full border border-stone-200 p-3 bg-white focus:outline-none focus:border-stone-900 font-sans rounded-md"></textarea>
                     </div>
                     <div>
                       <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Bullet Points (Comma separated)</label>
                       <input [ngModel]="draft.solutionList?.join(', ')" (ngModelChange)="updateList('solutionList', $event)" class="w-full border border-stone-200 p-3 bg-white focus:outline-none focus:border-stone-900 font-sans rounded-md">
                     </div>
                   </div>
                 </div>

                 <!-- Contribution -->
                 <div class="p-5 border border-stone-200 rounded-lg bg-stone-50/50">
                   <h4 class="text-base font-serif font-bold text-stone-900 mb-4">3. My Contribution</h4>
                   <div class="space-y-4">
                     <div>
                       <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Story/Text</label>
                       <textarea [(ngModel)]="draft.contribution" rows="3" class="w-full border border-stone-200 p-3 bg-white focus:outline-none focus:border-stone-900 font-sans rounded-md"></textarea>
                     </div>
                     <div>
                       <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Bullet Points (Comma separated)</label>
                       <input [ngModel]="draft.contributionList?.join(', ')" (ngModelChange)="updateList('contributionList', $event)" class="w-full border border-stone-200 p-3 bg-white focus:outline-none focus:border-stone-900 font-sans rounded-md">
                     </div>
                   </div>
                 </div>

                 <!-- Outcome -->
                 <div class="p-5 border border-stone-200 rounded-lg bg-stone-50/50">
                   <h4 class="text-base font-serif font-bold text-stone-900 mb-4">4. Outcome</h4>
                   <div class="space-y-4">
                     <div>
                       <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Story/Text</label>
                       <textarea [(ngModel)]="draft.outcome" rows="3" class="w-full border border-stone-200 p-3 bg-white focus:outline-none focus:border-stone-900 font-sans rounded-md"></textarea>
                     </div>
                     <div>
                       <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Bullet Points (Comma separated)</label>
                       <input [ngModel]="draft.outcomeList?.join(', ')" (ngModelChange)="updateList('outcomeList', $event)" class="w-full border border-stone-200 p-3 bg-white focus:outline-none focus:border-stone-900 font-sans rounded-md">
                     </div>
                   </div>
                 </div>
               </div>
             </section>

             <hr class="border-stone-100">

             <!-- Technologies -->
             <section>
               <h3 class="text-sm font-bold font-sans uppercase tracking-widest text-stone-900 mb-6 flex items-center gap-2">
                 <mat-icon class="text-gold-500 text-sm w-4 h-4" style="font-size: 16px;">code</mat-icon> Technologies Stack
               </h3>
               <div>
                 <label class="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Technologies (Comma separated)</label>
                 <input [ngModel]="draft.technologies?.join(', ')" (ngModelChange)="updateList('technologies', $event)" class="w-full border border-stone-200 p-3 bg-stone-50 focus:outline-none focus:border-stone-900 font-sans rounded-md" placeholder="e.g. Angular, Tailwind CSS, PostgreSQL">
               </div>
             </section>
           </div>

           <div class="p-6 md:p-8 bg-stone-50 border-t border-stone-200 flex justify-end gap-4 rounded-b-xl">
             <button (click)="cancelEdit()" class="px-6 py-2 border border-stone-200 bg-white text-stone-600 font-mono text-sm hover:bg-stone-50 transition-colors rounded-md shadow-sm">Cancel</button>
             <button (click)="saveProject()" class="px-6 py-2 bg-stone-900 text-white font-mono text-sm hover:bg-gold-500 hover:text-stone-900 transition-colors flex items-center gap-2 rounded-md shadow-sm"><mat-icon class="text-sm w-4 h-4" style="font-size: 16px;">save</mat-icon> Save Project</button>
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

  updateList(key: keyof Project, value: string) {
    (this.draft as any)[key] = value.split(',').map(s => s.trim()).filter(s => !!s);
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
