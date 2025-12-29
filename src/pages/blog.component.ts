import { Component, inject, signal, computed } from '@angular/core';
import { DataService } from '../services/data.service';
import { NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-blog',
  template: `
    <div class="px-8 md:px-16 lg:px-24 py-12 md:py-24 max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-end mb-24 gap-8 border-b border-stone-900 pb-8">
        <h1 class="text-6xl md:text-8xl font-serif font-black text-stone-900 tracking-tighter">Journal.</h1>
        
        <div class="w-full md:w-auto relative">
           <input 
            type="text" 
            [(ngModel)]="searchQuery"
            placeholder="Type to search..."
            class="w-full md:w-64 bg-transparent border-b border-stone-300 py-2 pr-8 focus:outline-none focus:border-gold-500 text-stone-900 placeholder-stone-400 font-serif italic"
          >
        </div>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
        @for (post of filteredPosts(); track post.id) {
          <article class="group flex flex-col h-full cursor-pointer" [routerLink]="['/blog', post.id]">
            <div class="relative h-64 overflow-hidden mb-6 bg-stone-100">
              <img [ngSrc]="post.imageUrl" fill class="object-cover transition-transform duration-700 group-hover:scale-110" alt="{{post.title}}">
            </div>
            
            <div class="flex flex-col flex-1">
               <div class="flex justify-between items-center text-xs font-mono text-stone-400 mb-3 uppercase tracking-wider">
                 <span>{{ post.category }}</span>
                 <span>{{ post.date }}</span>
               </div>
               
               <h2 class="text-2xl font-serif font-bold text-stone-900 mb-4 leading-tight group-hover:text-gold-600 transition-colors">
                 {{ post.title }}
               </h2>
               
               <p class="text-stone-500 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                 {{ post.excerpt }}
               </p>

               <span class="text-stone-900 font-bold text-sm border-b border-stone-200 self-start pb-1 group-hover:border-gold-500 transition-colors">Read Story</span>
            </div>
          </article>
        }
        
        @if (filteredPosts().length === 0) {
           <div class="col-span-full text-center py-20">
             <p class="text-stone-400 font-serif italic text-2xl">No stories found.</p>
           </div>
        }
      </div>
    </div>
  `,
  imports: [NgOptimizedImage, FormsModule, RouterLink]
})
export class BlogComponent {
  private dataService = inject(DataService);
  posts = this.dataService.getBlogPosts();
  searchQuery = signal('');

  filteredPosts = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.posts.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.excerpt.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  });
}