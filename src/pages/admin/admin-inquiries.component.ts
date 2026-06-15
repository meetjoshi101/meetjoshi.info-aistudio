import { Component, inject } from '@angular/core';
import { DataService, Inquiry } from '../../services/data.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-inquiries',
  template: `
    <div class="p-12 max-w-6xl mx-auto">
      <header class="flex justify-between items-end mb-12 border-b border-stone-200 pb-8">
        <div>
          <h1 class="text-4xl font-serif font-bold text-stone-900 tracking-tight">Inquiries</h1>
          <p class="text-stone-500 font-mono text-sm mt-2">Manage incoming contact requests</p>
        </div>
      </header>

      <div class="grid grid-cols-1 gap-4">
        @for (inq of inquiries(); track inq.id) {
          <div class="bg-white border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow">
             <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="font-serif font-bold text-xl text-stone-900 flex items-center gap-3">
                    {{ inq.name }} 
                    @if(inq.status === 'new') {
                      <span class="bg-gold-500 text-stone-900 text-[10px] uppercase font-mono px-2 py-0.5 rounded-full inline-block">New</span>
                    }
                  </h3>
                  <a [href]="'mailto:' + inq.email" class="text-sm font-mono text-stone-500 hover:text-gold-600 transition-colors">{{ inq.email }}</a>
                </div>
                <div class="text-xs font-mono text-stone-400 text-right">
                  {{ inq.createdAt?.toDate() | date:'medium' }}
                  
                  <div class="mt-2 text-right space-x-2">
                    @if(inq.status === 'new' && inq.id) {
                      <button (click)="markRead(inq.id)" class="text-xs uppercase tracking-widest font-mono text-stone-600 hover:text-stone-900 border-b border-stone-300 pb-0.5">Mark Read</button>
                    }
                  </div>
                </div>
             </div>
             
             <div class="bg-stone-50 p-4 border border-stone-100 rounded text-stone-700 whitespace-pre-wrap font-sans text-sm leading-relaxed">
               {{ inq.message }}
             </div>
          </div>
        } @empty {
          <div class="p-12 text-center text-stone-400 font-mono bg-stone-50/50 border border-stone-200 border-dashed rounded">
            No inquiries yet.
          </div>
        }
      </div>
    </div>
  `,
  imports: [MatIconModule, DatePipe]
})
export class AdminInquiriesComponent {
  private dataService = inject(DataService);
  public inquiries = toSignal(this.dataService.getInquiries(), { initialValue: [] });

  async markRead(id: string) {
    await this.dataService.updateInquiryStatus(id, 'read');
  }
}
