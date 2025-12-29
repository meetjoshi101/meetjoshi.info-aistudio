import { Component, inject, signal, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService, Project } from '../services/data.service';
import { NgOptimizedImage, Location } from '@angular/common';
import { SafeHtmlPipe } from '../pipes/safe-html.pipe';

@Component({
  selector: 'app-project-details',
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (loading()) {
      <div class="min-h-screen flex items-center justify-center">
         <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div>
      </div>
    } @else if (project(); as p) {
      <div class="animate-fade-in pb-24">
        
        <!-- Header Section -->
        <header class="pt-12 pb-16 px-8 md:px-16 lg:px-24 max-w-7xl mx-auto border-b border-gold-100">
          <div class="mb-8">
             <button (click)="goBack()" class="text-xs font-mono text-gold-600 uppercase tracking-widest hover:underline mb-8 block">
               ← Back to Archive
             </button>
             <span class="inline-block px-3 py-1 border border-stone-200 rounded-full text-xs font-bold text-stone-500 uppercase tracking-wide mb-6">{{ p.category }}</span>
             <h1 class="text-5xl md:text-7xl lg:text-8xl font-serif font-medium text-stone-900 leading-[1.1] mb-12">
               {{ p.title }}
             </h1>
          </div>

          <!-- Meta Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 border-t border-stone-100 pt-8">
            <div>
              <span class="block text-xs font-mono text-stone-400 uppercase tracking-widest mb-2">Client</span>
              <span class="text-lg font-serif text-stone-800">{{ p.client || 'Confidential' }}</span>
            </div>
            <div>
              <span class="block text-xs font-mono text-stone-400 uppercase tracking-widest mb-2">Year</span>
              <span class="text-lg font-serif text-stone-800">{{ p.year || '2023' }}</span>
            </div>
            <div>
              <span class="block text-xs font-mono text-stone-400 uppercase tracking-widest mb-2">Services</span>
              <span class="text-lg font-serif text-stone-800">{{ p.category }} Development</span>
            </div>
            <div>
               <span class="block text-xs font-mono text-stone-400 uppercase tracking-widest mb-2">Tech</span>
               <div class="flex flex-wrap gap-1">
                 @for(t of p.technologies; track t) {
                   <span class="text-sm font-sans text-stone-600">{{ t }}@if(!$last){,}</span>
                 }
               </div>
            </div>
          </div>
        </header>

        <!-- Hero Image -->
        <div class="w-full h-[50vh] md:h-[70vh] relative overflow-hidden bg-surface mb-24">
          <img [ngSrc]="p.imageUrl" priority fill class="object-cover" alt="{{p.title}}">
        </div>

        <!-- Content Strategy Switcher -->
        <div class="px-8 md:px-16 lg:px-24 max-w-5xl mx-auto space-y-24">
          
          <!-- Case 1: Structured Data (Fallback / Local) -->
          @if (p.challenge || p.solution) {
             <div class="grid md:grid-cols-12 gap-12">
              <div class="md:col-span-4">
                <h2 class="text-2xl font-serif font-bold text-stone-900 sticky top-32">The Challenge</h2>
              </div>
              <div class="md:col-span-8">
                <p class="text-xl md:text-2xl font-light text-stone-600 leading-relaxed">
                  {{ p.challenge || p.description }}
                </p>
              </div>
            </div>

            <div class="w-full h-px bg-gold-100"></div>

            <div class="grid md:grid-cols-12 gap-12">
              <div class="md:col-span-4">
                <h2 class="text-2xl font-serif font-bold text-stone-900 sticky top-32">Our Solution</h2>
              </div>
              <div class="md:col-span-8">
                <p class="text-lg text-stone-600 leading-relaxed mb-6">
                  {{ p.solution || 'Detailed architectural breakdown.' }}
                </p>
                <div class="bg-surface p-8 rounded-lg border border-gold-50 my-8">
                   <h4 class="font-serif font-bold text-gold-600 mb-4">Key Features</h4>
                   <ul class="space-y-2">
                     <li class="flex items-start gap-2 text-stone-700">
                       <span class="text-gold-500 mt-1">●</span> Custom Architecture
                     </li>
                     <li class="flex items-start gap-2 text-stone-700">
                       <span class="text-gold-500 mt-1">●</span> Performance Optimization
                     </li>
                     <li class="flex items-start gap-2 text-stone-700">
                       <span class="text-gold-500 mt-1">●</span> Scalable Infrastructure
                     </li>
                   </ul>
                </div>
              </div>
            </div>
            
             <div class="w-full h-px bg-gold-100"></div>

             <div class="grid md:grid-cols-12 gap-12">
              <div class="md:col-span-4">
                <h2 class="text-2xl font-serif font-bold text-stone-900 sticky top-32">The Outcome</h2>
              </div>
              <div class="md:col-span-8">
                 <p class="text-lg text-stone-600 leading-relaxed">
                  {{ p.outcome || 'The project was a success, meeting all KPIs and exceeding client expectations.' }}
                </p>
                <div class="mt-12 p-8 bg-stone-900 text-gold-100 italic font-serif text-xl md:text-2xl text-center leading-relaxed rounded-xl">
                  "An absolute game-changer for our business operations."
                </div>
              </div>
            </div>

          } @else if (p.content) {
            <!-- Case 2: HTML Content from Hashnode -->
             <div class="grid md:grid-cols-12 gap-12">
                <div class="md:col-span-4">
                  <h2 class="text-2xl font-serif font-bold text-stone-900 sticky top-32">Case Study</h2>
                </div>
                <div class="md:col-span-8">
                   <div class="prose prose-stone prose-lg 
                       prose-headings:font-serif prose-headings:font-bold 
                       prose-p:text-stone-600 prose-p:leading-loose 
                       prose-a:text-gold-600 hover:prose-a:text-gold-500 
                       prose-img:rounded-xl prose-img:shadow-lg" 
                        [innerHTML]="p.content | safeHtml">
                   </div>
                </div>
             </div>
          }

        </div>

        <!-- Next Project (Mock logic) -->
        <div class="mt-32 border-t border-stone-200 pt-24 px-8 text-center">
           <p class="text-xs font-mono text-stone-400 uppercase tracking-widest mb-4">Next Project</p>
           <a routerLink="/projects" class="inline-block text-4xl md:text-6xl font-serif font-bold text-stone-900 hover:text-gold-600 transition-colors">
             View All Work
           </a>
        </div>

      </div>
    } @else {
      <div class="min-h-screen flex flex-col items-center justify-center">
        <h2 class="text-3xl font-serif mb-4">Project Not Found</h2>
        <a routerLink="/projects" class="text-gold-600 underline">Back to Archive</a>
      </div>
    }
  `,
  imports: [NgOptimizedImage, RouterLink, SafeHtmlPipe]
})
export class ProjectDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private location = inject(Location);
  
  project = signal<Project | undefined>(undefined);
  loading = signal(true);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loading.set(true);
        this.dataService.getProjectBySlug(id).subscribe(p => {
          this.project.set(p);
          this.loading.set(false);
          window.scrollTo(0, 0);
        });
      }
    });
  }

  goBack() {
    this.location.back();
  }
}