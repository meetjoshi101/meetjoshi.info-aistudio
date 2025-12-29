import { Component, inject, signal, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService, BlogPost } from '../services/data.service';
import { NgOptimizedImage, Location } from '@angular/common';

@Component({
  selector: 'app-blog-details',
  encapsulation: ViewEncapsulation.None, // Allow styling of inner HTML
  template: `
    @if (post(); as p) {
      <article class="animate-fade-in pb-24">
        
        <!-- Header -->
        <header class="pt-16 pb-16 px-6 text-center max-w-4xl mx-auto">
          <div class="flex items-center justify-center gap-4 text-xs font-mono text-stone-400 uppercase tracking-widest mb-6">
            <span class="text-gold-600">{{ p.category }}</span>
            <span>•</span>
            <span>{{ p.date }}</span>
             <span>•</span>
            <span>{{ p.readTime }}</span>
          </div>
          
          <h1 class="text-4xl md:text-6xl font-serif font-bold text-stone-900 leading-tight mb-8">
            {{ p.title }}
          </h1>

          <div class="flex items-center justify-center gap-3">
             <div class="w-8 h-8 rounded-full bg-stone-200 overflow-hidden">
                <img src="https://picsum.photos/id/996/100/100" class="w-full h-full object-cover" alt="Author">
             </div>
             <span class="text-sm font-medium text-stone-600">By {{ p.author || 'Meet Joshi' }}</span>
          </div>
        </header>

        <!-- Feature Image -->
        <div class="w-full h-[400px] md:h-[600px] relative overflow-hidden mb-16 px-4 md:px-12">
           <img [ngSrc]="p.imageUrl" fill class="object-cover rounded-xl shadow-2xl shadow-stone-200/50" alt="{{p.title}}">
        </div>

        <!-- Content -->
        <div class="px-6 max-w-3xl mx-auto">
           <div class="prose prose-stone prose-lg md:prose-xl prose-headings:font-serif prose-headings:font-bold prose-p:text-stone-600 prose-p:leading-loose prose-a:text-gold-600 hover:prose-a:text-gold-500 first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-[-5px] first-letter:text-gold-500" 
                [innerHTML]="p.content">
           </div>
           
           <!-- Tags / Share -->
           <div class="mt-16 pt-8 border-t border-stone-200 flex justify-between items-center">
              <div class="flex gap-2">
                <span class="px-3 py-1 bg-stone-100 text-xs text-stone-600 rounded-full">#{{p.category}}</span>
                <span class="px-3 py-1 bg-stone-100 text-xs text-stone-600 rounded-full">#Tech</span>
              </div>
              
              <div class="flex gap-4 text-stone-400">
                <button class="hover:text-gold-600 transition-colors">Share</button>
                <button class="hover:text-gold-600 transition-colors">Save</button>
              </div>
           </div>
        </div>
        
        <!-- Related / Nav -->
        <div class="max-w-4xl mx-auto mt-24 px-6">
           <h3 class="font-serif font-bold text-2xl mb-8 border-b border-stone-200 pb-4">Read Next</h3>
           <div class="grid md:grid-cols-2 gap-8">
              <a routerLink="/blog" class="group block bg-white p-6 rounded-xl border border-stone-100 hover:border-gold-200 transition-all hover:shadow-lg hover:shadow-gold-100/50">
                 <span class="text-xs text-gold-600 font-mono mb-2 block">Journal</span>
                 <h4 class="font-serif font-bold text-xl group-hover:text-gold-600 transition-colors">Back to all articles</h4>
                 <p class="text-stone-500 text-sm mt-2">Explore more thoughts on design and engineering.</p>
              </a>
           </div>
        </div>

      </article>
    }
  `,
  imports: [NgOptimizedImage, RouterLink]
})
export class BlogDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  
  post = signal<BlogPost | undefined>(undefined);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.post.set(this.dataService.getBlogPostById(id));
      window.scrollTo(0, 0);
    });
  }
}