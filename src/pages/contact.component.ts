import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-contact',
  template: `
    <div class="px-8 md:px-16 lg:px-24 py-12 md:py-24 min-h-screen flex items-center">
      <div class="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-24">
        
        <!-- Info -->
        <div>
           <h1 class="text-6xl md:text-8xl font-serif font-black text-stone-900 mb-12 tracking-tighter">Get in <br> touch.</h1>
           
           <p class="text-xl text-stone-600 font-light mb-12">
             Currently open for new opportunities and collaborations.
           </p>
           
           <div class="space-y-8 text-lg">
             <div>
               <span class="block text-xs font-mono text-stone-400 mb-1 uppercase tracking-widest">Email</span>
               <a href="mailto:hello@meetjoshi.info" class="font-serif font-bold text-2xl hover:text-gold-600 transition-colors">hello@meetjoshi.info</a>
             </div>
             
             <div>
               <span class="block text-xs font-mono text-stone-400 mb-1 uppercase tracking-widest">Based In</span>
               <span class="font-serif font-bold text-2xl">San Francisco, CA</span>
             </div>

             <div class="pt-8">
               <span class="block text-xs font-mono text-stone-400 mb-4 uppercase tracking-widest">Socials</span>
               <div class="flex gap-6">
                 <a href="#" class="text-stone-900 hover:text-gold-600 font-bold">LinkedIn</a>
                 <a href="#" class="text-stone-900 hover:text-gold-600 font-bold">Twitter</a>
                 <a href="#" class="text-stone-900 hover:text-gold-600 font-bold">GitHub</a>
               </div>
             </div>
           </div>
        </div>

        <!-- Form -->
        <div class="bg-white p-10 border border-stone-200 shadow-xl shadow-stone-200/50">
           @if (submitted) {
             <div class="flex flex-col items-center justify-center p-8 text-center h-full">
               <h3 class="text-2xl font-serif font-bold text-stone-900 mb-4">Thank you!</h3>
               <p class="text-stone-600 font-sans">Your inquiry has been successfully sent. I will get back to you shortly.</p>
               <button (click)="submitted = false" class="mt-8 px-6 py-2 border-b border-stone-900 font-bold uppercase tracking-widest text-xs hover:text-gold-600 transition-colors">Send Another</button>
             </div>
           } @else {
             <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="space-y-8">
               
               <div class="grid grid-cols-2 gap-6">
                 <div class="space-y-2">
                   <label class="text-xs font-bold text-stone-900 uppercase tracking-wide">Name</label>
                   <input formControlName="name" type="text" class="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-gold-500 transition-colors bg-transparent placeholder-stone-300" placeholder="Jane Doe">
                 </div>
                 <div class="space-y-2">
                   <label class="text-xs font-bold text-stone-900 uppercase tracking-wide">Email</label>
                   <input formControlName="email" type="email" class="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-gold-500 transition-colors bg-transparent placeholder-stone-300" placeholder="jane@example.com">
                 </div>
               </div>

               <div class="space-y-2">
                 <label class="text-xs font-bold text-stone-900 uppercase tracking-wide">Subject</label>
                 <select formControlName="subject" class="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-gold-500 transition-colors bg-transparent text-stone-600">
                   <option value="freelance">Freelance Inquiry</option>
                   <option value="job">Job Opportunity</option>
                   <option value="collab">Collaboration</option>
                 </select>
               </div>

               <div class="space-y-2">
                 <label class="text-xs font-bold text-stone-900 uppercase tracking-wide">Message</label>
                 <textarea formControlName="message" rows="4" class="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-gold-500 transition-colors bg-transparent resize-none placeholder-stone-300" placeholder="How can we help?"></textarea>
               </div>

               <button type="submit" [disabled]="contactForm.invalid" class="w-full bg-stone-900 text-white py-4 font-bold uppercase tracking-widest hover:bg-gold-600 transition-colors disabled:opacity-50">
                 Send Inquiry
               </button>
             </form>
           }
        </div>

      </div>
    </div>
  `,
  imports: [ReactiveFormsModule]
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private dataService = inject(DataService);
  
  public submitted = false;

  contactForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: ['freelance', Validators.required],
    message: ['', Validators.required]
  });

  async onSubmit() {
    if (this.contactForm.valid) {
      const formValue = this.contactForm.value;
      await this.dataService.submitInquiry({
        name: formValue.name as string,
        email: formValue.email as string,
        message: `[${formValue.subject}] ${formValue.message}`,
      });
      this.submitted = true;
      this.contactForm.reset({ subject: 'freelance' });
    }
  }
}