import { Component, OnInit, AfterViewInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
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
    <div class="px-4 sm:px-0">
      <div class="mb-6">
        <h2 class="text-2xl font-serif text-stone-900">{{ isEditMode() ? 'Edit Project' : 'New Project' }}</h2>
      </div>

      @if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {{ error() }}
        </div>
      }

      <form [formGroup]="projectForm" (ngSubmit)="onSubmit()" class="bg-white shadow rounded-lg p-6 space-y-6">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <!-- Title -->
          <div class="md:col-span-2">
            <label for="title" class="block text-sm font-medium text-stone-700">Title *</label>
            <input
              id="title"
              type="text"
              formControlName="title"
              class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-3 py-2 border"
              placeholder="Project title"
            />
            @if (projectForm.get('title')?.invalid && projectForm.get('title')?.touched) {
              <p class="mt-1 text-sm text-red-600">Title is required</p>
            }
          </div>

          <!-- Slug -->
          <div class="md:col-span-2">
            <label for="slug" class="block text-sm font-medium text-stone-700">Slug * (URL identifier)</label>
            <input
              id="slug"
              type="text"
              formControlName="id"
              class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-3 py-2 border"
              placeholder="project-slug"
            />
            @if (projectForm.get('id')?.invalid && projectForm.get('id')?.touched) {
              <p class="mt-1 text-sm text-red-600">Slug is required</p>
            }
          </div>

          <!-- Client -->
          <div>
            <label for="client" class="block text-sm font-medium text-stone-700">Client</label>
            <input
              id="client"
              type="text"
              formControlName="client"
              class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-3 py-2 border"
              placeholder="Client name"
            />
          </div>

          <!-- Year -->
          <div>
            <label for="year" class="block text-sm font-medium text-stone-700">Year</label>
            <input
              id="year"
              type="text"
              formControlName="year"
              class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-3 py-2 border"
              placeholder="2024"
            />
          </div>

          <!-- Category -->
          <div>
            <label for="category" class="block text-sm font-medium text-stone-700">Category *</label>
            <select
              id="category"
              formControlName="category"
              class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-3 py-2 border"
            >
              <option value="">Select category</option>
              <option value="Web">Web</option>
              <option value="Mobile">Mobile</option>
              <option value="Design">Design</option>
              <option value="AI">AI</option>
            </select>
            @if (projectForm.get('category')?.invalid && projectForm.get('category')?.touched) {
              <p class="mt-1 text-sm text-red-600">Category is required</p>
            }
          </div>

          <!-- Published -->
          <div class="flex items-center">
            <input
              id="published"
              type="checkbox"
              formControlName="published"
              class="h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded"
            />
            <label for="published" class="ml-2 block text-sm text-stone-900">
              Published (visible to public)
            </label>
          </div>

          <!-- Description -->
          <div class="md:col-span-2">
            <label for="description" class="block text-sm font-medium text-stone-700">Description *</label>
            <textarea
              id="description"
              formControlName="description"
              rows="3"
              class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-3 py-2 border"
              placeholder="Brief project description"
            ></textarea>
            @if (projectForm.get('description')?.invalid && projectForm.get('description')?.touched) {
              <p class="mt-1 text-sm text-red-600">Description is required</p>
            }
          </div>

          <!-- Image Upload -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-stone-700">Project Image *</label>
            @if (currentImageUrl()) {
              <div class="mt-2 mb-2">
                <img [src]="currentImageUrl()" alt="Preview" class="h-40 w-auto rounded border border-stone-200">
              </div>
            }
            <input
              type="file"
              (change)="onImageChange($event)"
              accept="image/*"
              class="mt-1 block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
            />
            @if (uploadingImage()) {
              <p class="mt-1 text-sm text-amber-600">Uploading image...</p>
            }
            @if (projectForm.get('imageUrl')?.invalid && projectForm.get('imageUrl')?.touched) {
              <p class="mt-1 text-sm text-red-600">Image is required</p>
            }
          </div>

          <!-- Technologies -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-stone-700 mb-2">Technologies</label>
            <div formArrayName="technologies" class="space-y-2">
              @for (tech of technologies.controls; track $index; let i = $index) {
                <div class="flex gap-2">
                  <input
                    [formControlName]="i"
                    type="text"
                    class="flex-1 rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-3 py-2 border"
                    placeholder="Technology name"
                  />
                  <button
                    type="button"
                    (click)="removeTechnology(i)"
                    class="px-3 py-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              }
            </div>
            <button
              type="button"
              (click)="addTechnology()"
              class="mt-2 text-sm text-amber-600 hover:text-amber-700"
            >
              + Add Technology
            </button>
          </div>

          <!-- Challenge -->
          <div class="md:col-span-2">
            <label for="challenge" class="block text-sm font-medium text-stone-700">Challenge</label>
            <textarea
              id="challenge"
              formControlName="challenge"
              rows="3"
              class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-3 py-2 border"
              placeholder="What was the challenge?"
            ></textarea>
          </div>

          <!-- Solution -->
          <div class="md:col-span-2">
            <label for="solution" class="block text-sm font-medium text-stone-700">Solution</label>
            <textarea
              id="solution"
              formControlName="solution"
              rows="3"
              class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-3 py-2 border"
              placeholder="How did you solve it?"
            ></textarea>
          </div>

          <!-- Outcome -->
          <div class="md:col-span-2">
            <label for="outcome" class="block text-sm font-medium text-stone-700">Outcome</label>
            <textarea
              id="outcome"
              formControlName="outcome"
              rows="3"
              class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-3 py-2 border"
              placeholder="What was the result?"
            ></textarea>
          </div>

          <!-- Content (EditorJS) -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-stone-700 mb-2">
              Content (Rich Editor)
              <span class="text-stone-500 font-normal">- Optional detailed content</span>
            </label>

            <!-- EditorJS Container -->
            <div
              id="editorjs-project-content"
              class="border border-stone-300 rounded-md bg-white min-h-[300px] p-4 prose prose-stone max-w-none"
            ></div>

            @if (!editorInitialized()) {
              <p class="mt-2 text-sm text-amber-600">Loading editor...</p>
            }
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3 pt-4 border-t border-stone-200">
          <button
            type="button"
            (click)="onCancel()"
            class="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="projectForm.invalid || saving()"
            class="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ saving() ? 'Saving...' : (isEditMode() ? 'Update Project' : 'Create Project') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class ProjectFormComponent implements OnInit, AfterViewInit, OnDestroy {
  projectForm: FormGroup;
  isEditMode = signal(false);
  saving = signal(false);
  uploadingImage = signal(false);
  error = signal('');
  currentImageUrl = signal('');
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
      client: [''],
      year: [''],
      description: ['', Validators.required],
      category: ['', Validators.required],
      technologies: this.fb.array([]),
      imageUrl: ['', Validators.required],
      challenge: [''],
      solution: [''],
      outcome: [''],
      content: [''],
      published: [false]
    });
  }

  get technologies() {
    return this.projectForm.get('technologies') as FormArray;
  }

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id');

    if (this.projectId) {
      this.isEditMode.set(true);
      this.loadProject(this.projectId);
    } else {
      this.addTechnology();
    }
  }

  private loadProject(id: string) {
    this.dataService.getAllProjects().subscribe({
      next: (projects) => {
        const project = projects.find(p => p.id === id);
        if (project) {
          this.currentImageUrl.set(project.imageUrl);

          // Clear existing technologies
          while (this.technologies.length) {
            this.technologies.removeAt(0);
          }

          // Add technologies from project
          project.technologies?.forEach(tech => {
            this.technologies.push(this.fb.control(tech));
          });

          // If no technologies, add one empty field
          if (!project.technologies?.length) {
            this.addTechnology();
          }

          this.projectForm.patchValue({
            id: project.id,
            title: project.title,
            client: project.client || '',
            year: project.year || '',
            description: project.description,
            category: project.category,
            imageUrl: project.imageUrl,
            challenge: project.challenge || '',
            solution: project.solution || '',
            outcome: project.outcome || '',
            content: project.content || '',
            published: project.published || false
          });
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

  addTechnology() {
    this.technologies.push(this.fb.control(''));
  }

  removeTechnology(index: number) {
    this.technologies.removeAt(index);
  }

  async onImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.uploadingImage.set(true);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name}`;
      const imageUrl = await this.supabaseService.uploadImage('project-images', file, filename);
      this.projectForm.patchValue({ imageUrl });
      this.currentImageUrl.set(imageUrl);
      this.uploadingImage.set(false);
    } catch (error) {
      this.error.set('Failed to upload image');
      this.uploadingImage.set(false);
      console.error('Upload error:', error);
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
          client: formValue.client,
          year: formValue.year,
          description: formValue.description,
          category: formValue.category,
          technologies: formValue.technologies.filter((t: string) => t.trim() !== ''),
          imageUrl: formValue.imageUrl,
          challenge: formValue.challenge,
          solution: formValue.solution,
          outcome: formValue.outcome,
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

  onCancel() {
    this.router.navigate(['/admin/projects']);
  }

  ngAfterViewInit() {
    // Initialize EditorJS after view is ready
    setTimeout(() => {
      this.initializeEditor();
    }, 100);
  }

  private async initializeEditor() {
    try {
      // Set the bucket for project images
      this.editorJSService.setImageBucket('project-images');

      const initialData = this.projectForm.get('content')?.value;

      const config = this.editorJSService.createEditorConfig(
        'editorjs-project-content',
        initialData || undefined,
        'Write detailed project content... (Optional)'
      );

      this.editor = await this.editorJSService.initializeEditor(config);
      this.editorInitialized.set(true);
    } catch (error) {
      console.error('Failed to initialize editor:', error);
      this.error.set('Failed to initialize editor');
    }
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editorJSService.destroyEditor(this.editor);
    }
  }
}
