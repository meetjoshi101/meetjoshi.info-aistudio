import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-about',
  template: `
    <div class="px-8 md:px-16 lg:px-24 py-12 md:py-24 max-w-6xl mx-auto">
      
      <div class="grid md:grid-cols-2 gap-16 md:gap-24 mb-32 items-center">
        <div class="order-2 md:order-1">
          <h1 class="text-6xl md:text-8xl font-serif font-black text-stone-900 mb-8 leading-none">Meet <br> Joshi.</h1>
          <h2 class="text-xl font-mono text-gold-600 mb-8 tracking-widest uppercase">Full-Stack Engineer</h2>
          <p class="text-lg md:text-xl text-stone-600 font-light leading-relaxed mb-8">
            I approach software development with the mindset of an architect and the soul of an artist.
            <br><br>
            With over 8 years in the field, I've learned that code is just a medium to solve human problems. My work connects complex backend logic with beautiful, intuitive frontend interfaces.
          </p>
          <a href="#" class="inline-flex items-center text-stone-900 font-bold border-2 border-stone-900 px-8 py-3 hover:bg-stone-900 hover:text-white transition-colors">
            Download Resume
          </a>
        </div>
        
        <div class="order-1 md:order-2 relative">
          <div class="aspect-[3/4] bg-stone-200 relative overflow-hidden">
             <!-- ID 338 or 91 usually good, let's go with 64 for portrait or 996 -->
             <!-- Added priority here -->
             <img ngSrc="https://picsum.photos/id/996/800/800" priority fill class="object-cover grayscale hover:grayscale-0 transition-all duration-1000" alt="Profile">
          </div>
          <div class="absolute -bottom-6 -right-6 w-32 h-32 bg-gold-500 z-[-1]"></div>
        </div>
      </div>

      <div class="grid md:grid-cols-12 gap-12 border-t border-stone-200 pt-24">
         <div class="md:col-span-4">
            <h3 class="text-3xl font-serif font-bold text-stone-900 mb-2">Experience</h3>
            <p class="text-stone-400 font-mono text-sm">A brief history</p>
         </div>
         
         <div class="md:col-span-8 space-y-12">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pb-12 border-b border-stone-100">
               <div class="text-stone-400 font-mono">2021 — Present</div>
               <div class="md:col-span-2">
                 <h4 class="text-xl font-bold text-stone-900 mb-2">Senior Frontend Engineer</h4>
                 <p class="text-gold-600 text-sm mb-4">TechFlow Systems</p>
                 <p class="text-stone-600">Spearheading migration to modern Angular. Improved performance metrics by 40% and mentored junior developers.</p>
               </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pb-12 border-b border-stone-100">
               <div class="text-stone-400 font-mono">2019 — 2021</div>
               <div class="md:col-span-2">
                 <h4 class="text-xl font-bold text-stone-900 mb-2">Product Designer</h4>
                 <p class="text-gold-600 text-sm mb-4">Creative Pulse</p>
                 <p class="text-stone-600">Led UI/UX initiatives for fintech products. Bridge between design and engineering teams.</p>
               </div>
            </div>

             <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div class="text-stone-400 font-mono">2016 — 2019</div>
               <div class="md:col-span-2">
                 <h4 class="text-xl font-bold text-stone-900 mb-2">Freelance Developer</h4>
                 <p class="text-gold-600 text-sm mb-4">Self-Employed</p>
                 <p class="text-stone-600">Delivered bespoke websites for diverse clientele, mastering the JAMstack ecosystem.</p>
               </div>
            </div>
         </div>
      </div>

    </div>
  `,
  imports: [NgOptimizedImage]
})
export class AboutComponent {}