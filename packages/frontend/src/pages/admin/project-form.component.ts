import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService, Project } from '../../services/data.service';
import { SupabaseService } from '../../services/supabase.service';
import { EditorJSService } from '../../services/editorjs.service';
import { from } from 'rxjs';
import EditorJS from '@editorjs/editorjs';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="bg-white shadow rounded-lg p-8">
          <!-- Header -->
          <div class="mb-8 pb-6 border-b border-stone-200">
            <h1 class="text-3xl font-serif font-bold text-stone-900">
              {{ isEditMode() ? 'Edit Project' : 'New Project' }}
            </h1>
            <p class="mt-2 text-sm text-stone-600">
              Use the rich editor to create your project case study
            </p>
          </div>

          @if (error()) {
            <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p class="text-sm text-red-800">{{ error() }}</p>
            </div>
          }

          <form [formGroup]="projectForm" (ngSubmit)="onSubmit()">
            <div class="space-y-6">
              <!-- Slug (ID) -->
              <div>
                <label for="id" class="block text-sm font-medium text-stone-700">
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  id="id"
                  formControlName="id"
                  [readonly]="isEditMode()"
                  class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-3 py-2 border"
                  placeholder="my-awesome-project"
                />
                @if (projectForm.get('id')?.invalid && projectForm.get('id')?.touched) {
                  <p class="mt-1 text-sm text-red-600">Slug is required</p>
                }
              </div>

              <!-- Title -->
              <div>
                <label for="title" class="block text-sm font-medium text-stone-700">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  formControlName="title"
                  class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-3 py-2 border"
                  placeholder="My Awesome Project"
                />
                @if (projectForm.get('title')?.invalid && projectForm.get('title')?.touched) {
                  <p class="mt-1 text-sm text-red-600">Title is required</p>
                }
              </div>

              <!-- Category -->
              <div>
                <label for="category" class="block text-sm font-medium text-stone-700">
                  Category
                </label>
                <select
                  id="category"
                  formControlName="category"
                  class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-3 py-2 border"
                >
                  <option value="Web">Web</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Design">Design</option>
                  <option value="AI">AI</option>
                </select>
              </div>

              <!-- Published -->
              <div class="flex items-center">
                <input
                  type="checkbox"
                  id="published"
                  formControlName="published"
                  class="h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded"
                />
                <label for="published" class="ml-2 block text-sm text-stone-700">
                  Published (visible to public)
                </label>
              </div>

              <!-- Rich Content Editor -->
              <div>
                <label class="block text-sm font-medium text-stone-700 mb-2">
                  Content *
                </label>

                <div class="relative">
                  <!-- Editor Container (always present) -->
                  <div
                    id="editorjs-project-content"
                    class="border border-stone-300 rounded-md bg-white min-h-[400px]"
                  ></div>

                  <!-- Loading Overlay -->
                  @if (!editorInitialized()) {
                    <div class="absolute inset-0 bg-stone-50/90 flex items-center justify-center rounded-md">
                      <p class="text-amber-600 font-medium">Loading editor...</p>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-3 pt-6 mt-8 border-t border-stone-200">
              <button
                type="button"
                (click)="onCancel()"
                class="px-4 py-2 border border-stone-300 rounded-md text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="saving() || !projectForm.valid"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ saving() ? 'Saving...' : (isEditMode() ? 'Update' : 'Create') }} Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProjectFormComponent implements OnInit, OnDestroy {
  projectForm: FormGroup;
  isEditMode = signal(false);
  saving = signal(false);
  error = signal('');
  projectId: string | null = null;

  // EditorJS properties
  private editor: EditorJS | null = null;
  editorInitialized = signal(false);

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private supabaseService: SupabaseService,
    private editorJSService: EditorJSService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.projectForm = this.fb.group({
      id: ['', Validators.required],
      title: ['', Validators.required],
      category: ['Web'],
      content: [null],
      published: [false]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.projectId = params['id'];
      if (this.projectId) {
        this.isEditMode.set(true);
        this.loadProject(this.projectId);
      } else {
        // For new projects, initialize editor immediately
        setTimeout(() => this.initializeEditor(), 100);
      }
    });
  }

  private loadProject(id: string) {
    this.dataService.getAllProjects().subscribe({
      next: (projects) => {
        const project = projects.find(p => p.id === id);
        if (project) {
          this.projectForm.patchValue({
            id: project.id,
            title: project.title,
            category: project.category,
            content: project.content,
            published: project.published || false
          });

          // Initialize editor AFTER data is loaded
          setTimeout(() => this.initializeEditor(), 100);
        } else {
          this.error.set('Project not found');
        }
      },
      error: (err) => {
        this.error.set('Failed to load project');
        console.error('Error loading project:', err);
      }
    });
  }

  private async initializeEditor() {
    try {
      // Set the bucket for project images
      this.editorJSService.setImageBucket('project-images');

      const initialData = this.projectForm.get('content')?.value;

      const config = this.editorJSService.createEditorConfig(
        'editorjs-project-content',
        initialData || undefined,
        'Start writing your project case study...'
      );

      this.editor = await this.editorJSService.initializeEditor(config);
      this.editorInitialized.set(true);
    } catch (error) {
      console.error('Failed to initialize editor:', error);
      this.error.set('Failed to initialize editor');
    }
  }

  async onSubmit() {
    if (this.projectForm.valid && this.editor) {
      this.saving.set(true);
      this.error.set('');

      try {
        // Save editor data
        const editorData = await this.editorJSService.saveEditorData(this.editor);

        // Update form with editor content
        this.projectForm.patchValue({
          content: editorData.blocks.length > 0 ? editorData : null
        });

        const formValue = this.projectForm.value;
        const slug = formValue.id;

        const projectData = {
          title: formValue.title,
          client: '',
          year: new Date().getFullYear().toString(),
          description: this.generateDescription(editorData),
          category: formValue.category,
          technologies: this.extractTechnologies(editorData),
          imageUrl: this.extractFirstImage(editorData) || 'https://picsum.photos/800/600',
          challenge: '',
          solution: '',
          outcome: '',
          content: formValue.content,
          published: formValue.published
        };

        const operation = this.isEditMode()
          ? from(this.dataService.updateProject(slug, projectData))
          : from(this.dataService.createProject(slug, projectData));

        operation.subscribe({
          next: () => {
            this.saving.set(false);
            this.router.navigate(['/admin/projects']);
          },
          error: (err) => {
            this.saving.set(false);
            this.error.set(`Failed to ${this.isEditMode() ? 'update' : 'create'} project`);
            console.error('Save error:', err);
          }
        });
      } catch (error) {
        this.saving.set(false);
        this.error.set('Failed to save editor content');
        console.error('Editor save error:', error);
      }
    }
  }

  private generateDescription(editorData: any): string {
    // Extract text from first paragraph or header
    if (editorData.blocks && editorData.blocks.length > 0) {
      for (const block of editorData.blocks) {
        if (block.type === 'paragraph' || block.type === 'header') {
          const text = block.data.text || '';
          // Strip HTML tags and truncate
          const plainText = text.replace(/<[^>]*>/g, '');
          return plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
        }
      }
    }
    return 'Project description';
  }

  private extractTechnologies(editorData: any): string[] {
    // Look for lists or code blocks that might contain technologies
    const techs: string[] = [];
    if (editorData.blocks) {
      editorData.blocks.forEach((block: any) => {
        if (block.type === 'list') {
          const items = block.data.items || [];
          items.forEach((item: string) => {
            const plainText = item.replace(/<[^>]*>/g, '').trim();
            if (plainText.length < 30) { // Likely a tech name
              techs.push(plainText);
            }
          });
        }
      });
    }
    return techs.length > 0 ? techs.slice(0, 5) : ['Angular', 'TypeScript'];
  }

  private extractFirstImage(editorData: any): string | null {
    // Extract the first image URL from content
    if (editorData.blocks) {
      for (const block of editorData.blocks) {
        if (block.type === 'image' && block.data.file?.url) {
          return block.data.file.url;
        }
      }
    }
    return null;
  }

  onCancel() {
    this.router.navigate(['/admin/projects']);
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editorJSService.destroyEditor(this.editor);
    }
  }
}
