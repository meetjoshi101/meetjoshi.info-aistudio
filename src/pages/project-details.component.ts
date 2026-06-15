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
      <div class="min-h-screen flex items-center justify-center bg-paper">
         <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-gold-600"></div>
      </div>
    } @else if (project(); as p) {
      <div class="animate-fade-in bg-paper pb-32">
        
        <!-- Premium Case Study Header -->
        <header class="pt-24 pb-16 px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto">
          <div class="max-w-5xl">
             <button (click)="goBack()" class="text-xs font-mono text-gold-600 uppercase tracking-widest hover:text-stone-900 transition-colors mb-12 flex items-center gap-2 group">
               <span class="group-hover:-translate-x-1 transition-transform">←</span> Back to Archive
             </button>
             
             <div class="flex items-center gap-4 mb-8">
               <span class="px-4 py-1.5 bg-stone-100 border border-stone-200 rounded-full text-xs font-bold text-stone-600 uppercase tracking-widest">{{ p.category }}</span>
               <span class="text-stone-400 font-mono text-sm">{{ p.year || '2023' }}</span>
             </div>

             <h1 class="text-5xl md:text-7xl lg:text-[6rem] font-serif font-medium text-stone-900 leading-[1.05] tracking-tight mb-12">
               {{ p.title }}
             </h1>
          </div>

          <!-- Project Meta Grid -->
          <div class="flex flex-wrap gap-x-12 gap-y-8 border-t border-stone-200 pt-8 mt-12 max-w-6xl">
            @if (p.industry) {
            <div>
              <span class="block text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-3">Industry</span>
              <span class="text-lg font-serif text-stone-800">{{ p.industry }}</span>
            </div>
            }
            @if (p.role) {
            <div>
              <span class="block text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-3">Role</span>
              <span class="text-lg font-serif text-stone-800">{{ p.role }}</span>
            </div>
            }
            @if (p.duration) {
            <div>
              <span class="block text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-3">Duration</span>
              <span class="text-lg font-serif text-stone-800">{{ p.duration }}</span>
            </div>
            }
            @if (p.client) {
            <div>
              <span class="block text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-3">Client</span>
              <span class="text-lg font-serif text-stone-800">{{ p.client }}</span>
            </div>
            }
            <div>
              <span class="block text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-3">Services</span>
              <span class="text-lg font-serif text-stone-800">{{ p.category }}</span>
            </div>
            @if (p.link) {
            <div class="ml-auto self-end">
              <a [href]="p.link" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-stone-50 font-mono text-xs uppercase tracking-widest hover:bg-gold-500 hover:text-stone-900 transition-colors rounded-full shadow-sm">
                View Project <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
              </a>
            </div>
            }
          </div>
        </header>

        <!-- Cinematic Hero Image -->
        <div class="w-full px-4 md:px-12 lg:px-20 max-w-[1400px] mx-auto mb-24 md:mb-32">
          <div class="relative w-full h-[60vh] md:h-[80vh] overflow-hidden rounded-2xl bg-stone-100 shadow-2xl shadow-stone-200/50 group">
            <img [ngSrc]="p.imageUrl" priority fill class="object-cover transition-transform duration-[2s] group-hover:scale-105" alt="{{p.title}}">
          </div>
        </div>

        <div class="px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto">
          <!-- Content Strategy Switcher -->
          @if (p.overview || p.problemList || p.solutionList || p.contributionList || p.outcomeList) {
             <!-- Case 1: Functional Case Study Template -->
             <div class="max-w-4xl mx-auto space-y-16 mt-16 pb-24">
               
               @if (p.overview || p.description) {
               <div class="text-left bg-stone-50 p-8 rounded-2xl border border-stone-100">
                 <h2 class="text-sm font-bold font-sans uppercase tracking-widest mb-4 text-stone-900 border-b border-stone-200 pb-2">
                   Overview
                 </h2>
                 <p class="text-lg md:text-xl text-stone-700 leading-relaxed font-light">
                   {{ p.overview || p.description }}
                 </p>
               </div>
               }

               <div class="space-y-16">
                 @if (p.challenge || (p.problemList && p.problemList.length)) {
                 <section>
                   <h2 class="text-2xl font-serif font-bold text-stone-900 mb-6 pb-2 border-b border-stone-100">
                     The Problem
                   </h2>
                   <div>
                     @if (p.challenge) {
                       <p class="text-lg text-stone-700 leading-relaxed mb-6">{{ p.challenge }}</p>
                     }
                     @if (p.problemList && p.problemList.length) {
                       <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
                         @for(item of p.problemList; track item) {
                           <li class="flex items-start gap-4 p-4 bg-white border border-stone-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                             <span class="text-gold-600 font-bold mt-0.5">•</span>
                             <span class="text-stone-700 font-medium">{{item}}</span>
                           </li>
                         }
                       </ul>
                     }
                   </div>
                 </section>
                 }

                 @if (p.solution || (p.solutionList && p.solutionList.length)) {
                 <section>
                   <h2 class="text-2xl font-serif font-bold text-stone-900 mb-6 pb-2 border-b border-stone-100">
                     The Solution
                   </h2>
                   <div>
                     @if (p.solution) {
                       <p class="text-lg text-stone-700 leading-relaxed mb-6">{{ p.solution }}</p>
                     }
                     @if (p.solutionList && p.solutionList.length) {
                       <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
                         @for(item of p.solutionList; track item) {
                           <li class="flex items-start gap-4 p-4 bg-white border border-stone-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                             <div class="w-1.5 h-1.5 rounded-full bg-stone-800 mt-2.5 shrink-0"></div>
                             <span class="text-stone-700 font-medium">{{item}}</span>
                           </li>
                         }
                       </ul>
                     }
                   </div>
                 </section>
                 }
               </div>

               @if (p.contribution || (p.contributionList && p.contributionList.length)) {
               <section>
                 <h2 class="text-2xl font-serif font-bold text-stone-900 mb-6 pb-2 border-b border-stone-100">
                   My Contribution
                 </h2>
                 @if (p.contribution) {
                   <p class="text-lg text-stone-700 leading-relaxed mb-6">{{ p.contribution }}</p>
                 }
                 @if (p.contributionList && p.contributionList.length) {
                 <ul class="space-y-3">
                   @for(item of p.contributionList; track item) {
                     <li class="flex items-center gap-4 p-4 bg-stone-50 border border-stone-100 rounded-xl">
                       <span class="text-stone-400 font-bold">✓</span>
                       <span class="text-stone-800 font-medium">{{item}}</span>
                     </li>
                   }
                 </ul>
                 }
               </section>
               }

               <!-- Image Gallery Block for case studies -->
               @if (p.galleryImages && p.galleryImages.length > 0) {
               <section class="grid grid-cols-1 md:grid-cols-2 gap-6 my-16">
                   @for (img of p.galleryImages; track img) {
                      <div class="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-sm bg-stone-100 border border-stone-200">
                         <img [src]="img" [alt]="'Gallery image for ' + p.title" class="w-full h-full object-cover">
                      </div>
                   }
               </section>
               }

               <div class="space-y-16">
                 
                 @if (p.technologies && p.technologies.length) {
                 <section>
                   <h2 class="text-2xl font-bold font-serif text-stone-900 mb-6 pb-2 border-b border-stone-100">Technology</h2>
                   <div class="flex flex-wrap gap-3">
                     @for(t of p.technologies; track t) {
                       <span class="px-4 py-2 bg-white text-stone-700 rounded-lg text-sm font-medium border border-stone-200 shadow-sm">{{ t }}</span>
                     }
                   </div>
                 </section>
                 }
                 
                 @if (p.outcome || (p.outcomeList && p.outcomeList.length)) {
                 <section>
                     <h2 class="text-2xl font-serif font-bold text-stone-900 mb-6 pb-2 border-b border-stone-100">
                       Outcome
                     </h2>
                     @if (p.outcome) {
                       <p class="text-lg text-stone-700 leading-relaxed mb-6">{{ p.outcome }}</p>
                     }
                     @if (p.outcomeList && p.outcomeList.length) {
                     <ul class="space-y-4">
                       @for(item of p.outcomeList; track item) {
                         <li class="flex items-start gap-4 p-5 border-l-4 border-gold-400 bg-white shadow-sm rounded-r-xl border-y border-r border-stone-100">
                           <p class="text-lg font-medium text-stone-800">{{item}}</p>
                         </li>
                       }
                     </ul>
                     }
                 </section>
                 }

                 @if (p.keyLearning || p.value) {
                 <section class="bg-stone-800 border border-stone-900 rounded-2xl p-8 shadow-xl">
                   <h2 class="text-sm font-bold font-sans text-gold-400 uppercase tracking-widest mb-4">
                     Key Learning
                   </h2>
                   <p class="text-xl font-serif text-stone-100 leading-relaxed font-medium">
                     {{ p.keyLearning || p.value }}
                   </p>
                 </section>
                 }
               </div>
             </div>

          } @else if (p.challenge || p.solution || p.research || p.product) {
            <!-- Case 2: Unstructured Case Study (Markdown/HTML) -->
            <div class="grid md:grid-cols-12 gap-12 lg:gap-24 relative items-start pb-24">
               <!-- Sticky Sidebar with Meta -->
               <aside class="md:col-span-4 lg:col-span-3 hidden md:block sticky top-32">
                 <div class="pr-8 border-r border-stone-200 py-4">
                    <h2 class="text-sm font-bold font-sans uppercase tracking-widest text-stone-400 mb-8 border-b border-stone-100 pb-4">Case Study Overview</h2>
                    <ul class="space-y-6">
                      <li>
                        <span class="block text-xs font-mono text-stone-400 mb-1">Focus</span>
                        <span class="text-stone-800 font-medium">{{ p.category }}</span>
                      </li>
                      <li>
                        <span class="block text-xs font-mono text-stone-400 mb-1">Timeline</span>
                        <span class="text-stone-800 font-medium">{{ p.year || '3 Months' }}</span>
                      </li>
                    </ul>
                 </div>
               </aside>
               
               <!-- Long form reading experience -->
               <div class="md:col-span-8 lg:col-span-9 max-w-3xl">
                  <div class="prose prose-stone prose-lg md:prose-xl text-left
                              prose-headings:font-serif prose-headings:font-bold prose-headings:text-stone-900
                              prose-h2:mt-16 prose-h2:mb-8 prose-h2:text-3xl
                              prose-p:text-stone-600 prose-p:leading-loose prose-p:font-light 
                              prose-a:text-gold-600 prose-a:font-medium hover:prose-a:text-gold-500 
                              prose-img:rounded-2xl prose-img:shadow-2xl prose-img:shadow-stone-200/50 prose-img:my-16
                              prose-blockquote:border-l-4 prose-blockquote:border-gold-500 prose-blockquote:bg-surface prose-blockquote:p-6 prose-blockquote:rounded-r-xl prose-blockquote:font-serif prose-blockquote:text-stone-800 prose-blockquote:italic
                              first-letter:text-7xl first-letter:font-serif first-letter:font-bold first-letter:text-stone-900 first-letter:float-left first-letter:mr-6 first-letter:mt-2
                              prose-li:text-stone-600" 
                       [innerHTML]="p.content | safeHtml">
                  </div>
               </div>
            </div>
          }
        </div>

        <!-- Next Project Call To Action -->
        <div class="mt-32 max-w-5xl mx-auto px-6 border-t font-serif border-stone-200 pt-32 text-center pb-16">
           <p class="text-sm font-mono text-stone-400 uppercase tracking-widest mb-6">Continue Exploring</p>
           <a routerLink="/projects" class="inline-block relative group">
             <span class="text-5xl md:text-7xl font-medium text-stone-300 group-hover:text-stone-900 transition-colors duration-500">View All Work</span>
             <div class="absolute -bottom-4 left-0 w-0 h-1 bg-gold-500 group-hover:w-full transition-all duration-700 ease-out"></div>
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