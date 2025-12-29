import { Component, inject, signal, computed } from '@angular/core';
import { DataService } from '../services/data.service';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-projects',
  template: `
    <div class="px-8 md:px-16 lg:px-24 py-12 md:py-24">
      <header class="mb-20 max-w-4xl">
        <h1 class="text-6xl md:text-7xl font-serif font-black text-stone-900 mb-8 tracking-tight">Archive.</h1>
        <p class="text-xl text-stone-500 font-light max-w-2xl">
          A comprehensive list of projects, case studies, and experiments.
        </p>
      </header>

      <!-- Filters -->
      <div class="flex flex-wrap gap-8 mb-20 border-b border-stone-200 pb-4">
        @for (cat of categories; track cat) {
          <button 
            (click)="setFilter(cat)"
            [class]="activeFilter() === cat ? 'text-stone-900 border-stone-900' : 'text-stone-400 border-transparent hover:text-stone-600'"
            class="pb-4 border-b-2 text-sm font-bold uppercase tracking-widest transition-all">
            {{ cat }}
          </button>
        }
      </div>

      <div class="space-y-32">
        @for (project of filteredProjects(); track project.id) {
          <article class="group grid md:grid-cols-12 gap-8 items-center cursor-pointer" [routerLink]="['/projects', project.id]">
            <!-- Large Image -->
            <div class="md:col-span-7 relative h-[400px] md:h-[500px] bg-stone-100 overflow-hidden">
               <img [ngSrc]="project.imageUrl" fill class="object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale group-hover:grayscale-0" alt="{{project.title}}">
            </div>
            
            <!-- Description -->
            <div class="md:col-span-5 md:pl-8">
              <span class="text-gold-600 font-mono text-xs mb-4 block">{{ project.category }}</span>
              <h2 class="text-4xl font-serif font-bold text-stone-900 mb-6 group-hover:underline decoration-gold-400 decoration-2 underline-offset-4">{{ project.title }}</h2>
              <p class="text-stone-600 leading-relaxed mb-8 line-clamp-3">{{ project.description }}</p>
              
              <div class="flex flex-wrap gap-2 mb-8">
                 @for (tech of project.technologies; track tech) {
                   <span class="text-xs font-mono border border-stone-200 px-2 py-1 text-stone-500">{{ tech }}</span>
                 }
              </div>

              <span class="text-stone-900 font-bold border-b border-stone-300 pb-1 hover:border-gold-500 hover:text-gold-600 transition-colors">
                View Case Study
              </span>
            </div>
          </article>
        }
      </div>
    </div>
  `,
  imports: [NgClass, NgOptimizedImage, RouterLink]
})
export class ProjectsComponent {
  private dataService = inject(DataService);
  
  projects = this.dataService.getProjects();
  categories = ['All', 'Web', 'Mobile', 'Design', 'AI'];
  activeFilter = signal<string>('All');

  filteredProjects = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'All') return this.projects;
    return this.projects.filter(p => p.category === filter);
  });

  setFilter(cat: string) {
    this.activeFilter.set(cat);
  }
}