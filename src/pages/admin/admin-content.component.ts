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
        <div class="bg-white border border-stone-200 p-8">
           <h2 class="text-xl font-serif font-bold mb-4">Home About Section</h2>
           <textarea [(ngModel)]="homeContent" rows="5" class="w-full border border-stone-200 p-4 font-sans text-stone-700 bg-stone-50 focus:outline-none focus:border-stone-900 mb-4"></textarea>
           <button (click)="saveContent('homeContent', homeContent())" class="bg-stone-900 text-stone-50 px-6 py-2 font-mono text-xs uppercase tracking-widest hover:bg-gold-500 hover:text-stone-900 transition-colors flex items-center gap-2">
             <mat-icon>save</mat-icon> Save Home Content
           </button>
        </div>
      </div>
    </div>
  `,
  imports: [FormsModule, MatIconModule]
})
export class AdminContentComponent {
  private fb = inject(FirebaseService);

  public homeContent = signal<string>('');

  constructor() {
    this.loadContent();
  }

  async loadContent() {
    try {
      const snap = await getDoc(doc(this.fb.db, 'siteContent', 'homeContent'));
      if (snap.exists()) {
        this.homeContent.set(snap.data()['content']);
      }
    } catch (e) {
      console.warn("Could not load home content in admin:", e);
    }
  }

  async saveContent(id: string, content: string) {
    try {
      await setDoc(doc(this.fb.db, 'siteContent', id), {
        type: id,
        content,
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
