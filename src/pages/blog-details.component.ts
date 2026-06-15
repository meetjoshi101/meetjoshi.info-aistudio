import { Component, inject, signal, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService, BlogPost } from '../services/data.service';
import { NgOptimizedImage, Location } from '@angular/common';
import { SafeHtmlPipe } from '../pipes/safe-html.pipe';

@Component({
  selector: 'app-blog-details',
  encapsulation: ViewEncapsulation.None, // Allow styling of inner HTML
  template: `
    @if (loading()) {
      <div class="min-h-screen flex items-center justify-center bg-paper">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-gold-600"></div>
      </div>
    } @else if (post(); as p) {
      <article class="animate-fade-in bg-paper pb-32">
        
        <!-- Setup Progress Bar Placeholder if wanted later (requires JS logic, just leaving visual space) -->
        <div class="fixed top-0 left-0 w-full h-1 bg-stone-100 z-50">
           <div class="h-full bg-gold-500 w-1/3"></div>
        </div>

        <!-- Premium Article Header -->
        <header class="pt-24 pb-16 px-6 max-w-5xl mx-auto">
          <div class="flex items-center gap-4 text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-8">
            <a routerLink="/blog" class="hover:text-gold-600 transition-colors flex items-center gap-1 group">
               <span class="group-hover:-translate-x-1 transition-transform">←</span> Journal
            </a>
            <span class="text-stone-300">/</span>
            <span class="text-gold-600 px-3 py-1 bg-gold-50 rounded-full border border-gold-100">{{ p.category }}</span>
            <span class="text-stone-300">/</span>
            <span>{{ p.date }}</span>
          </div>
          
          <h1 class="text-5xl md:text-7xl font-serif font-medium text-stone-900 leading-[1.1] tracking-tight mb-10 w-11/12">
            {{ p.title }}
          </h1>

          <div class="flex items-center justify-between border-y border-stone-200 py-6 mt-12 text-sm">
             <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full overflow-hidden border border-stone-200 shadow-sm">
                   <img src="https://picsum.photos/id/996/100/100" class="w-full h-full object-cover" alt="Author">
                </div>
                <div>
                   <span class="block font-sans font-bold text-stone-800">{{ p.author || 'Meet Joshi' }}</span>
                   <span class="block font-serif text-stone-500 italic">{{ p.readTime }}</span>
                </div>
             </div>
             
             <div class="flex items-center gap-4 text-stone-400 font-mono text-xs uppercase tracking-widest">
               <button class="hover:text-gold-600 transition-colors flex flex-col items-center gap-1">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
               </button>
               <button class="hover:text-gold-600 transition-colors flex flex-col items-center gap-1">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
               </button>
             </div>
          </div>
        </header>

        <!-- Feature Image (Cinematic Width) -->
        <div class="w-full max-w-[1400px] mx-auto px-4 md:px-12 mb-20 text-left">
           <div class="w-full h-[50vh] md:h-[70vh] relative overflow-hidden rounded-2xl shadow-2xl shadow-stone-200/40">
             <img [ngSrc]="p.imageUrl" priority fill class="object-cover" alt="{{p.title}}">
           </div>
           <p class="font-mono text-[10px] uppercase tracking-widest text-stone-400 mt-4">Header illustration or primary photography</p>
        </div>

        <!-- Main Content Area -->
        <div class="px-6 flex flex-col lg:flex-row gap-16 max-w-[1400px] mx-auto items-start">
           
           <!-- Hidden but functional spacer for layout balance -->
           <div class="hidden lg:block lg:w-64 flex-shrink-0 sticky top-32">
             <h4 class="font-serif font-bold text-stone-800 mb-6 pb-2 border-b border-stone-200">In this article</h4>
             <!-- Mock Table of Contents could be generated here -->
             <ul class="space-y-4 font-sans text-sm text-stone-500 font-light">
               <li class="hover:text-gold-600 cursor-pointer transition-colors">Introduction</li>
               <li class="hover:text-gold-600 cursor-pointer transition-colors">Core Concepts</li>
               <li class="hover:text-gold-600 cursor-pointer transition-colors">Implementation</li>
               <li class="hover:text-gold-600 cursor-pointer transition-colors">Conclusion</li>
             </ul>
           </div>

           <!-- Content Body with Prose -->
           <div class="flex-1 max-w-3xl w-full mx-auto lg:mx-0">
             
              <div class="text-2xl md:text-3xl font-serif text-stone-600 italic leading-snug mb-16 border-l-4 border-gold-400 pl-6 py-2">
                 {{ p.excerpt || 'An exploration into modern patterns, thoughtful design, and robust architecture for scalable web ecosystems.' }}
              </div>

              <!-- High Quality Typography Container -->
              <div class="prose prose-stone prose-lg md:prose-xl w-full max-w-none text-left
                          prose-headings:font-serif prose-headings:font-bold prose-headings:text-stone-900
                          prose-h2:mt-16 prose-h2:mb-8 prose-h2:text-3xl prose-h2:border-b prose-h2:border-stone-100 prose-h2:pb-4
                          prose-h3:mt-12 prose-h3:mb-6 prose-h3:text-2xl
                          prose-p:text-stone-600 prose-p:leading-[1.8] prose-p:font-light 
                          prose-a:text-gold-600 prose-a:font-medium prose-a:no-underline prose-a:border-b prose-a:border-gold-200 hover:prose-a:border-gold-600 hover:prose-a:bg-gold-50 transition-all
                          prose-img:rounded-2xl prose-img:shadow-2xl prose-img:shadow-stone-200/50 prose-img:my-16
                          prose-blockquote:border-l-4 prose-blockquote:border-stone-900 prose-blockquote:bg-stone-50 prose-blockquote:p-8 prose-blockquote:rounded-r-xl prose-blockquote:font-serif prose-blockquote:text-stone-800 prose-blockquote:italic
                          prose-code:text-gold-700 prose-code:bg-stone-100 prose-code:px-2 prose-code:py-0.5 prose-code:rounded-md prose-code:before:hidden prose-code:after:hidden
                          first-letter:text-7xl first-letter:font-serif first-letter:font-black first-letter:text-stone-900 first-letter:float-left first-letter:mr-6 first-letter:mt-2 first-letter:bg-stone-100 first-letter:px-4 first-letter:pt-2 first-letter:rounded-lg
                          prose-li:text-stone-600 prose-li:leading-relaxed" 
                   [innerHTML]="p.content | safeHtml">
              </div>

              <!-- Gallery Grid for Multiple Images -->
              @if (p.galleryImages && p.galleryImages.length > 0) {
                <div class="mt-24 mb-16 text-left">
                  <h3 class="font-serif font-bold text-3xl mb-10 text-stone-900">Visual Story</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    @for (img of p.galleryImages; track img) {
                      <div class="relative h-72 md:h-96 overflow-hidden rounded-2xl bg-stone-100 shadow-xl shadow-stone-200/60 group">
                         <img [ngSrc]="img" fill class="object-cover transition-transform duration-1000 group-hover:scale-[1.03]" alt="Story detail">
                      </div>
                    }
                  </div>
                </div>
              }
              
              <!-- Footer Meta (Tags) -->
              <div class="mt-24 pt-8 border-t border-stone-200 flex flex-wrap gap-2">
                 <span class="px-4 py-2 bg-stone-100/80 border border-stone-200 text-xs font-mono text-stone-500 uppercase tracking-wider rounded-full hover:bg-stone-200 transition-colors cursor-pointer">#{{p.category}}</span>
                 <span class="px-4 py-2 bg-stone-100/80 border border-stone-200 text-xs font-mono text-stone-500 uppercase tracking-wider rounded-full hover:bg-stone-200 transition-colors cursor-pointer">#Engineering</span>
                 <span class="px-4 py-2 bg-stone-100/80 border border-stone-200 text-xs font-mono text-stone-500 uppercase tracking-wider rounded-full hover:bg-stone-200 transition-colors cursor-pointer">#Design</span>
              </div>
           </div>

           <!-- Empty spacer for right side balance on ultrawide -->
           <div class="hidden lg:block lg:w-32 flex-shrink-0"></div>
        </div>
        
        <!-- Enhanced Next Article / Nav Layout -->
        <div class="max-w-[1400px] mx-auto mt-32 border-t border-stone-200">
           <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200">
               <a routerLink="/blog" class="block p-16 md:p-24 hover:bg-stone-50 transition-colors group">
                  <span class="text-[10px] text-stone-400 font-mono uppercase tracking-widest mb-4 block group-hover:text-gold-600 transition-colors">Previous Article</span>
                  <h4 class="font-serif font-medium text-3xl md:text-4xl text-stone-800 transition-colors pb-4">Back to Journal</h4>
               </a>
               <a routerLink="/blog" class="block p-16 md:p-24 hover:bg-stone-50 transition-colors group text-right">
                  <span class="text-[10px] text-stone-400 font-mono uppercase tracking-widest mb-4 block group-hover:text-gold-600 transition-colors">Next Article</span>
                  <h4 class="font-serif font-medium text-3xl md:text-4xl text-stone-800 transition-colors pb-4">System Design Principles</h4>
               </a>
           </div>
        </div>

      </article>
    } @else {
      <div class="min-h-screen flex flex-col items-center justify-center p-8">
         <h1 class="text-4xl font-serif font-bold mb-4">Post not found</h1>
         <p class="text-stone-500 mb-8">The article you are looking for does not exist or has been moved.</p>
         <a routerLink="/blog" class="text-gold-600 font-bold hover:underline">Back to Journal</a>
      </div>
    }
  `,
  imports: [NgOptimizedImage, RouterLink, SafeHtmlPipe]
})
export class BlogDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  
  post = signal<BlogPost | undefined>(undefined);
  loading = signal(true);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['id'];
      if (slug) {
        this.loading.set(true);
        this.dataService.getBlogPostBySlug(slug).subscribe(data => {
          this.post.set(data);
          this.loading.set(false);
          window.scrollTo(0, 0);
        });
      }
    });
  }
}