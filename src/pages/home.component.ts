import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../services/data.service';
import { NgOptimizedImage } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FirebaseService } from '../services/firebase.service';
import { doc, getDoc } from 'firebase/firestore';

@Component({
  selector: 'app-home',
  template: `
    <div class="px-8 md:px-16 lg:px-24 py-12 md:py-24 space-y-32">
      
      <!-- Personal Hero with Action -->
      <section class="relative">
        <span class="inline-flex items-center gap-2 bg-gold-100 text-gold-900 font-mono text-xs font-bold tracking-widest px-3 py-1 rounded-full mb-8">
           <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
           AVAILABLE FOR HIRE
        </span>

        <h1 class="text-6xl md:text-8xl lg:text-9xl font-serif font-medium text-stone-800 leading-[0.9] tracking-tight mb-12">
          {{ homeContent()?.titleLine1 || 'Digital' }} <br>
          <span class="italic text-stone-400 font-normal">{{ homeContent()?.titleLine2 || 'Creator' }}</span> & <br>
          {{ homeContent()?.titleLine3 || 'Problem Solver.' }}
        </h1>
        
        <div class="flex flex-col md:flex-row gap-12 items-start max-w-4xl border-t border-gold-200 pt-10">
           <p class="text-xl md:text-2xl text-stone-600 font-sans font-light leading-relaxed flex-1">
             {{ homeContent()?.descStart || "Hi, I'm" }} <span class="text-stone-900 font-bold">{{ homeContent()?.name || 'Meet Joshi' }}</span>. {{ homeContent()?.descMid || 'I craft high-performance digital experiences with a focus on' }} <span class="text-stone-800 font-medium">{{ homeContent()?.highlight1 || 'soft aesthetics' }}</span> {{ homeContent()?.descEnd || 'and' }} <span class="text-stone-800 font-medium">{{ homeContent()?.highlight2 || 'robust architecture.' }}</span>
           </p>
           
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
          <div class="flex flex-col gap-2">
            <h2 class="text-3xl md:text-4xl font-serif font-medium italic text-stone-800">Selected Works</h2>
          </div>
          <span class="hidden md:block h-px flex-1 bg-gold-200 mx-8 mb-4"></span>
          <span class="text-xs font-mono text-gold-400">Recent</span>
        </div>

        @if (featuredProjects(); as projects) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
            @for (project of projects; track project.id; let i = $index) {
               <div class="group cursor-pointer" [routerLink]="['/projects', project.id]">
                 <div class="relative overflow-hidden mb-8 aspect-[4/3] bg-surface rounded-sm">
                   <img [ngSrc]="project.imageUrl" [priority]="i === 0" fill class="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100" alt="{{project.title}}">
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
        } @else {
           <div class="flex justify-center py-12">
             <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-300"></div>
           </div>
        }
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
export class HomeComponent implements OnInit {
  public dataService = inject(DataService);
  private fb = inject(FirebaseService);
  
  projectsSignal = toSignal(this.dataService.getProjects());
  
  public homeContent = signal<any>(null);

  featuredProjects = computed(() => {
    return this.projectsSignal()?.slice(0, 4);
  });

  skills = [
    { name: 'Angular' },
    { name: 'React' },
    { name: 'Node.js' },
    { name: 'Design' },
    { name: 'AWS' },
  ];

  async ngOnInit() {
    try {
      const snap = await getDoc(doc(this.fb.db, 'siteContent', 'homeContent'));
      if (snap.exists()) {
        this.homeContent.set(snap.data());
      }
    } catch (e) {
      console.warn("Could not load home content (this is normal if first time setup):", e);
    }
  }
}