import { Component, inject, signal, computed } from '@angular/core';
import { DataService } from '../services/data.service';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-projects',
  template: `
    <div class="px-8 md:px-16 lg:px-24 py-12 md:py-24">
      <header class="mb-20 max-w-6xl flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <h1 class="text-6xl md:text-7xl font-serif font-black text-stone-900 mb-8 tracking-tight">Archive.</h1>
          <p class="text-xl text-stone-500 font-light max-w-2xl mb-4">
            A comprehensive list of projects, case studies, and experiments.
          </p>
          <span class="text-xs font-mono text-stone-400 uppercase tracking-widest">
             Source: {{ dataService.projectsSource() }}
          </span>
        </div>
        
        <!-- Admin Sync Button & Settings -->
        <div class="flex flex-col items-end gap-2 w-full md:w-auto">
            <button (click)="toggleSettings()" class="text-xs font-mono text-stone-400 hover:text-stone-600">
               [Configure Sync]
            </button>
            
            @if (showSettings()) {
               <div class="bg-white p-6 border border-stone-200 shadow-xl rounded-lg absolute z-20 mt-8 right-8 md:right-24 w-80">
                  <h4 class="font-bold text-stone-900 mb-4">Hashnode Settings</h4>
                  <div class="space-y-4 mb-4">
                    <div>
                       <label class="block text-xs font-bold text-stone-500 mb-1">Host (e.g. meetjoshi.hashnode.dev)</label>
                       <input [(ngModel)]="configHost" class="w-full border border-stone-300 p-2 text-sm rounded">
                    </div>
                    <div>
                       <label class="block text-xs font-bold text-stone-500 mb-1">Series Slug (default: project)</label>
                       <input [(ngModel)]="configSeries" class="w-full border border-stone-300 p-2 text-sm rounded" placeholder="project">
                    </div>
                    <div>
                       <label class="block text-xs font-bold text-stone-500 mb-1">API Key (Personal Access Token)</label>
                       <input [(ngModel)]="configKey" type="password" class="w-full border border-stone-300 p-2 text-sm rounded">
                    </div>
                  </div>
                  <div class="flex justify-end gap-2">
                     <button (click)="saveConfig()" class="bg-stone-900 text-white px-4 py-2 text-xs font-bold rounded hover:bg-gold-600">Save</button>
                  </div>
               </div>
            }

            <button (click)="syncProjects()" [disabled]="isSyncing()" class="text-xs font-mono text-stone-400 hover:text-gold-600 disabled:opacity-50 underline decoration-dotted">
              @if (isSyncing()) { Syncing... } @else { [Admin: Seed Local Projects] }
            </button>
            @if (syncStatus()) {
              <span class="text-[10px] font-mono mt-1 max-w-[200px] text-right" [class.text-green-600]="syncStatus().includes('Success')" [class.text-red-500]="syncStatus().includes('Fail')">
                {{ syncStatus() }}
              </span>
            }
        </div>
      </header>

      <!-- Filters -->
      <div class="flex flex-wrap gap-8 mb-20 border-b border-stone-200 pb-4">
        @for (cat of categories; track cat) {
          <button 
            (click)="setFilter(cat)"
            [class]="activeFilter() === cat ? 'text-stone-900 border-stone-900' : 'text-stone-400 border-transparent hover:text-stone-600'"
            class="pb-4 border-b-2 text-sm font-bold uppercase tracking-widest transition-all">
            {{ cat }}
          </button>
        }
      </div>

      <div class="space-y-32">
        @if (filteredProjects(); as projects) {
          @for (project of projects; track project.id; let i = $index) {
            <article class="group grid md:grid-cols-12 gap-8 items-center cursor-pointer" [routerLink]="['/projects', project.id]">
              <!-- Large Image -->
              <div class="md:col-span-7 relative h-[400px] md:h-[500px] bg-stone-100 overflow-hidden">
                 <img [ngSrc]="project.imageUrl" [priority]="i === 0" fill class="object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale group-hover:grayscale-0" alt="{{project.title}}">
              </div>
              
              <!-- Description -->
              <div class="md:col-span-5 md:pl-8">
                <span class="text-gold-600 font-mono text-xs mb-4 block">{{ project.category }}</span>
                <h2 class="text-4xl font-serif font-bold text-stone-900 mb-6 group-hover:underline decoration-gold-400 decoration-2 underline-offset-4">{{ project.title }}</h2>
                <p class="text-stone-600 leading-relaxed mb-8 line-clamp-3">{{ project.description }}</p>
                
                <div class="flex flex-wrap gap-2 mb-8">
                   @for (tech of project.technologies; track tech) {
                     <span class="text-xs font-mono border border-stone-200 px-2 py-1 text-stone-500">{{ tech }}</span>
                   }
                </div>

                <span class="text-stone-900 font-bold border-b border-stone-300 pb-1 hover:border-gold-500 hover:text-gold-600 transition-colors">
                  View Case Study
                </span>
              </div>
            </article>
          }
          
          @if(projects.length === 0) {
             <div class="py-12 text-center text-stone-400 font-mono">
               No projects found for this category. <br>
               @if(dataService.projectsSource().includes('Hashnode')) {
                 <span class="text-xs mt-2 block">Make sure your Hashnode posts have the tag <strong>#project</strong>.</span>
               }
             </div>
          }

        } @else {
           <!-- Skeleton Loading -->
           <div class="animate-pulse space-y-8">
             <div class="h-[400px] bg-stone-100 rounded"></div>
             <div class="h-[400px] bg-stone-100 rounded"></div>
           </div>
        }
      </div>
    </div>
  `,
  imports: [NgClass, NgOptimizedImage, RouterLink, FormsModule]
})
export class ProjectsComponent {
  public dataService = inject(DataService);
  
  projectsSignal = toSignal(this.dataService.getProjects());
  categories = ['All', 'Web', 'Mobile', 'Design', 'AI'];
  activeFilter = signal<string>('All');

  // Config State
  showSettings = signal(false);
  configHost = '';
  configKey = '';
  configSeries = '';

  isSyncing = signal(false);
  syncStatus = signal('');

  constructor() {
    // Init form with current service values
    this.configHost = this.dataService.hashnodeHost();
    this.configKey = this.dataService.hashnodeApiKey();
    this.configSeries = this.dataService.hashnodeSeriesSlug();
  }

  toggleSettings() {
    this.showSettings.update(v => !v);
  }

  saveConfig() {
    this.dataService.updateConfig(this.configHost, this.configKey, this.configSeries);
    this.showSettings.set(false);
    alert('Configuration updated. Try syncing again.');
  }

  filteredProjects = computed(() => {
    const all = this.projectsSignal();
    if (!all) return null;
    
    const filter = this.activeFilter();
    if (filter === 'All') return all;
    return all.filter(p => p.category === filter);
  });

  setFilter(cat: string) {
    this.activeFilter.set(cat);
  }

  syncProjects() {
    const series = this.dataService.hashnodeSeriesSlug();
    if (!confirm(`Sync projects to ${this.dataService.hashnodeHost()} into Series '${series}'?\n\nThis will attempt to auto-tag posts with '#project'.`)) return;
    
    this.isSyncing.set(true);
    this.syncStatus.set('Initializing...');

    this.dataService.syncLocalProjectsToHashnode().subscribe({
      next: (results: any[]) => {
        const successes = results.filter(r => r.success);
        const failures = results.filter(r => !r.success);
        
        let message = `Sync Process Complete.\n\n`;

        if (successes.length > 0) {
            message += `✅ SUCCESSFULLY UPLOADED (${successes.length}):\n`;
            message += successes.map(r => `• ${r.title}`).join('\n');
            message += `\n\n`;
        }

        if (failures.length > 0) {
            message += `❌ FAILED (${failures.length}):\n`;
            message += failures.map(r => `• ${r.title}: ${r.error}`).join('\n');
            message += `\n\nNote: Duplicate slugs are common if posts already exist.`;
            
            console.warn('Sync Failures:', failures);
            this.syncStatus.set(`Finished with ${failures.length} errors.`);
        } else {
             this.syncStatus.set(`Success! ${successes.length} projects uploaded.`);
        }
        
        alert(message);
        this.isSyncing.set(false);
      },
      error: (err) => {
        console.error(err);
        this.syncStatus.set('Critical Failure');
        alert('Critical Error during sync:\n' + err.message);
        this.isSyncing.set(false);
      }
    });
  }
}