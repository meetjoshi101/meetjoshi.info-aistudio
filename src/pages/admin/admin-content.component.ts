import { Component, inject, signal } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-content',
  template: `
    <div class="p-12 max-w-4xl mx-auto">
      <header class="mb-12 border-b border-stone-200 pb-8">
        <h1 class="text-4xl font-serif font-bold text-stone-900 tracking-tight">Site Content</h1>
        <p class="text-stone-500 font-mono text-sm mt-2">Update main sections of the website.</p>
      </header>

      <div class="space-y-12">
        <div class="bg-white border border-stone-200 p-8 rounded-lg shadow-sm">
           <h2 class="text-xl font-serif font-bold mb-6 text-stone-800">Home Header</h2>
           
           <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             <div class="space-y-4 col-span-1 md:col-span-2">
               <h3 class="text-sm font-bold text-stone-500 uppercase tracking-widest border-b border-stone-100 pb-2">Hero Title</h3>
               <div>
                 <label class="block text-xs font-mono text-stone-500 mb-1">Title Line 1</label>
                 <input type="text" [(ngModel)]="homeData.titleLine1" class="w-full border border-stone-200 p-3 font-sans text-stone-700 bg-stone-50 focus:outline-none focus:border-stone-900 rounded-md">
               </div>
               <div>
                 <label class="block text-xs font-mono text-stone-500 mb-1">Title Line 2 (Italicized)</label>
                 <input type="text" [(ngModel)]="homeData.titleLine2" class="w-full border border-stone-200 p-3 font-sans text-stone-700 bg-stone-50 focus:outline-none focus:border-stone-900 rounded-md">
               </div>
               <div>
                 <label class="block text-xs font-mono text-stone-500 mb-1">Title Line 3</label>
                 <input type="text" [(ngModel)]="homeData.titleLine3" class="w-full border border-stone-200 p-3 font-sans text-stone-700 bg-stone-50 focus:outline-none focus:border-stone-900 rounded-md">
               </div>
             </div>

             <div class="space-y-4 col-span-1 md:col-span-2 mt-4">
               <h3 class="text-sm font-bold text-stone-500 uppercase tracking-widest border-b border-stone-100 pb-2">Profile Description</h3>
               
               <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label class="block text-xs font-mono text-stone-500 mb-1">Start (e.g. "Hi, I'm")</label>
                   <input type="text" [(ngModel)]="homeData.descStart" class="w-full border border-stone-200 p-3 font-sans text-stone-700 bg-stone-50 focus:outline-none focus:border-stone-900 rounded-md">
                 </div>
                 <div>
                   <label class="block text-xs font-mono text-stone-500 mb-1">Name (Bold)</label>
                   <input type="text" [(ngModel)]="homeData.name" class="w-full border border-stone-200 p-3 font-sans text-stone-700 bg-stone-50 focus:outline-none focus:border-stone-900 rounded-md">
                 </div>
               </div>
               
               <div>
                 <label class="block text-xs font-mono text-stone-500 mb-1">Middle Description</label>
                 <textarea [(ngModel)]="homeData.descMid" rows="2" class="w-full border border-stone-200 p-3 font-sans text-stone-700 bg-stone-50 focus:outline-none focus:border-stone-900 rounded-md"></textarea>
               </div>
               
               <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                   <label class="block text-xs font-mono text-stone-500 mb-1">Highlight 1</label>
                   <input type="text" [(ngModel)]="homeData.highlight1" class="w-full border border-stone-200 p-3 font-sans text-stone-700 bg-stone-50 focus:outline-none focus:border-stone-900 rounded-md">
                 </div>
                 <div>
                   <label class="block text-xs font-mono text-stone-500 mb-1">Connector (e.g. "and")</label>
                   <input type="text" [(ngModel)]="homeData.descEnd" class="w-full border border-stone-200 p-3 font-sans text-stone-700 bg-stone-50 focus:outline-none focus:border-stone-900 rounded-md">
                 </div>
                 <div>
                   <label class="block text-xs font-mono text-stone-500 mb-1">Highlight 2</label>
                   <input type="text" [(ngModel)]="homeData.highlight2" class="w-full border border-stone-200 p-3 font-sans text-stone-700 bg-stone-50 focus:outline-none focus:border-stone-900 rounded-md">
                 </div>
               </div>
             </div>
           </div>

           <div class="flex justify-end pt-4 border-t border-stone-100">
             <button (click)="saveContent('homeContent', homeData)" class="bg-stone-900 text-stone-50 px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-gold-500 hover:text-stone-900 transition-colors flex items-center gap-2 rounded-md shadow-sm">
               <mat-icon>save</mat-icon> Save Home Content
             </button>
           </div>
        </div>
      </div>
    </div>
  `,
  imports: [FormsModule, MatIconModule]
})
export class AdminContentComponent {
  private fb = inject(FirebaseService);

  public homeData = {
    titleLine1: 'Digital',
    titleLine2: 'Creator',
    titleLine3: 'Problem Solver.',
    descStart: "Hi, I'm",
    name: 'Meet Joshi',
    descMid: 'I craft high-performance digital experiences with a focus on',
    highlight1: 'soft aesthetics',
    descEnd: 'and',
    highlight2: 'robust architecture.'
  };

  constructor() {
    this.loadContent();
  }

  async loadContent() {
    try {
      const snap = await getDoc(doc(this.fb.db, 'siteContent', 'homeContent'));
      if (snap.exists()) {
        const data = snap.data();
        if (data && typeof data === 'object' && data['titleLine1']) {
           this.homeData = { ...this.homeData, ...data };
        }
      }
    } catch (e) {
      console.warn("Could not load home content in admin:", e);
    }
  }

  async saveContent(id: string, data: any) {
    try {
      await setDoc(doc(this.fb.db, 'siteContent', id), {
        type: id,
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      alert('Content saved successfully.');
    } catch (e) {
      console.error(e);
      alert('Error saving content.');
    }
  }
}
