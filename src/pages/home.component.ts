import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../services/data.service';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-home',
  template: `
    <div class="px-8 md:px-16 lg:px-24 py-12 md:py-24 space-y-32">
      
      <!-- Personal Hero with Action -->
      <section class="relative">
        <!-- Replaced EST 2016 with a personal availability tag -->
        <span class="inline-flex items-center gap-2 bg-gold-100 text-gold-900 font-mono text-xs font-bold tracking-widest px-3 py-1 rounded-full mb-8">
           <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
           AVAILABLE FOR HIRE
        </span>

        <h1 class="text-6xl md:text-8xl lg:text-9xl font-serif font-medium text-stone-800 leading-[0.9] tracking-tight mb-12">
          Digital <br>
          <span class="italic text-stone-400 font-normal">Creator</span> & <br>
          Problem Solver.
        </h1>
        
        <div class="flex flex-col md:flex-row gap-12 items-start max-w-4xl border-t border-gold-200 pt-10">
           <p class="text-xl md:text-2xl text-stone-600 font-sans font-light leading-relaxed flex-1">
             Hi, I'm <span class="text-stone-900 font-bold">Meet Joshi</span>. I craft high-performance digital experiences with a focus on <span class="text-stone-800 font-medium">soft aesthetics</span> and <span class="text-stone-800 font-medium">robust architecture</span>.
           </p>
           
           <!-- CTA Section moved to top as requested -->
           <div class="flex flex-col gap-4 w-full md:w-auto">
             <a routerLink="/contact" class="inline-block text-center px-8 py-4 bg-stone-900 text-paper font-bold uppercase tracking-widest hover:bg-gold-500 hover:text-white transition-all duration-300 rounded-lg shadow-xl shadow-stone-200">
               Start a Project
             </a>
             <a routerLink="/projects" class="group flex items-center justify-center gap-4 text-stone-600 font-bold tracking-widest uppercase text-xs py-2 hover:text-gold-600 transition-colors">
               View Collections
               <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
             </a>
           </div>
        </div>
      </section>

      <!-- Selected Works Gallery -->
      <section>
        <div class="flex items-end justify-between mb-16">
          <h2 class="text-3xl md:text-4xl font-serif font-medium italic text-stone-800">Selected Works</h2>
          <span class="hidden md:block h-px flex-1 bg-gold-200 mx-8 mb-4"></span>
          <span class="text-xs font-mono text-gold-400">Recent</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
          @for (project of featuredProjects; track project.id) {
             <div class="group cursor-pointer" [routerLink]="['/projects', project.id]">
               <div class="relative overflow-hidden mb-8 aspect-[4/3] bg-surface rounded-sm">
                 <img [ngSrc]="project.imageUrl" fill class="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100" alt="{{project.title}}">
               </div>
               <div class="flex justify-between items-start border-b border-stone-100 pb-4 group-hover:border-gold-300 transition-colors">
                 <div>
                   <h3 class="text-2xl font-serif font-medium text-stone-800 mb-2 group-hover:text-gold-600 transition-colors">{{ project.title }}</h3>
                   <p class="text-stone-500 text-sm font-sans">{{ project.category }}</p>
                 </div>
                 <span class="text-gold-300 font-serif italic text-xl group-hover:translate-x-2 transition-transform">→</span>
               </div>
             </div>
          }
        </div>
      </section>

      <!-- Skills (Softer presentation) -->
      <section class="py-16 border-y border-gold-100">
         <div class="flex flex-wrap justify-center md:justify-between gap-8 md:gap-16 items-center">
           @for(skill of skills; track skill.name) {
             <span class="text-2xl md:text-3xl font-serif text-stone-300 hover:text-gold-500 cursor-default transition-colors duration-500">{{ skill.name }}</span>
           }
         </div>
      </section>
    </div>
  `,
  imports: [RouterLink, NgOptimizedImage]
})
export class HomeComponent {
  private dataService = inject(DataService);
  featuredProjects = this.dataService.getProjects().slice(0, 4); 

  skills = [
    { name: 'Angular' },
    { name: 'React' },
    { name: 'Node.js' },
    { name: 'Design' },
    { name: 'AWS' },
  ];
}