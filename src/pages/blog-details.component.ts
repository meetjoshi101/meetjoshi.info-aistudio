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
      <div class="min-h-screen flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div>
      </div>
    } @else if (post(); as p) {
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
           <!-- Added priority here -->
           <img [ngSrc]="p.imageUrl" priority fill class="object-cover rounded-xl shadow-2xl shadow-stone-200/50" alt="{{p.title}}">
        </div>

        <!-- Content Body -->
        <div class="px-6 max-w-3xl mx-auto">
           <!-- Hashnode content returns raw HTML which often needs specific styling classes -->
           <!-- Added SafeHtml pipe and prose classes from Tailwind Typography -->
           <div class="prose prose-stone prose-lg md:prose-xl 
                       prose-headings:font-serif prose-headings:font-bold 
                       prose-p:text-stone-600 prose-p:leading-loose 
                       prose-a:text-gold-600 hover:prose-a:text-gold-500 
                       prose-img:rounded-xl prose-img:shadow-lg
                       first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-[-5px] first-letter:text-gold-500" 
                [innerHTML]="p.content | safeHtml">
           </div>

           <!-- Gallery Grid for Multiple Images -->
           @if (p.galleryImages && p.galleryImages.length > 0) {
             <div class="mt-16 mb-8">
               <h3 class="font-serif font-bold text-2xl mb-8 text-stone-900">Visual Story</h3>
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                 @for (img of p.galleryImages; track img) {
                   <div class="relative h-64 md:h-72 overflow-hidden rounded-lg bg-stone-100 group">
                      <img [ngSrc]="img" fill class="object-cover transition-transform duration-700 group-hover:scale-105" alt="Story detail">
                   </div>
                 }
               </div>
               <p class="text-xs text-stone-400 font-mono mt-4 text-center">Images from the article archive.</p>
             </div>
           }
           
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