import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../../services/data.service';
import { BlogPost } from '@meetjoshi/shared';
import { SupabaseService } from '../../services/supabase.service';
import { EditorJSService } from '../../services/editorjs.service';
import { from } from 'rxjs';
import EditorJS from '@editorjs/editorjs';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="bg-white shadow rounded-lg p-8">
          <!-- Header -->
          <div class="mb-8 pb-6 border-b border-stone-200">
            <h1 class="text-3xl font-serif font-bold text-stone-900">
              {{ isEditMode() ? 'Edit Blog Post' : 'New Blog Post' }}
            </h1>
            <p class="mt-2 text-sm text-stone-600">
              Use the rich editor to create your content
            </p>
          </div>

          @if (error()) {
            <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p class="text-sm text-red-800">{{ error() }}</p>
            </div>
          }

          <form [formGroup]="blogForm" (ngSubmit)="onSubmit()">
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
                  placeholder="my-blog-post"
                />
                @if (blogForm.get('id')?.invalid && blogForm.get('id')?.touched) {
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
                  placeholder="My Amazing Blog Post"
                />
                @if (blogForm.get('title')?.invalid && blogForm.get('title')?.touched) {
                  <p class="mt-1 text-sm text-red-600">Title is required</p>
                }
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
                    id="editorjs-blog-content"
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
                [disabled]="saving() || !blogForm.valid"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ saving() ? 'Saving...' : (isEditMode() ? 'Update' : 'Create') }} Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class BlogFormComponent implements OnInit, OnDestroy {
  blogForm: FormGroup;
  isEditMode = signal(false);
  saving = signal(false);
  error = signal('');
  postId: string | null = null;

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
    this.blogForm = this.fb.group({
      id: ['', Validators.required],
      title: ['', Validators.required],
      content: [null],
      published: [false]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.postId = params['id'];
      if (this.postId) {
        this.isEditMode.set(true);
        this.loadBlogPost(this.postId);
      } else {
        // For new posts, initialize editor immediately
        setTimeout(() => this.initializeEditor(), 100);
      }
    });
  }

  private loadBlogPost(id: string) {
    this.dataService.getAllBlogPosts().subscribe({
      next: (posts) => {
        const post = posts.find(p => p.id === id);
        if (post) {
          this.blogForm.patchValue({
            id: post.id,
            title: post.title,
            content: post.content,
            published: post.published || false
          });

          // Initialize editor AFTER data is loaded
          setTimeout(() => this.initializeEditor(), 100);
        } else {
          this.error.set('Blog post not found');
        }
      },
      error: (err) => {
        this.error.set('Failed to load blog post');
        console.error('Error loading blog post:', err);
      }
    });
  }

  private async initializeEditor() {
    try {
      // Set the bucket for blog images
      this.editorJSService.setImageBucket('blog-images');

      const initialData = this.blogForm.get('content')?.value;

      const config = this.editorJSService.createEditorConfig(
        'editorjs-blog-content',
        initialData || undefined,
        'Start writing your blog post...'
      );

      this.editor = await this.editorJSService.initializeEditor(config);
      this.editorInitialized.set(true);
    } catch (error) {
      console.error('Failed to initialize editor:', error);
      this.error.set('Failed to initialize editor');
    }
  }

  async onSubmit() {
    if (this.blogForm.valid && this.editor) {
      this.saving.set(true);
      this.error.set('');

      try {
        // Save editor data
        const editorData = await this.editorJSService.saveEditorData(this.editor);

        // Update form with editor content
        this.blogForm.patchValue({
          content: editorData.blocks.length > 0 ? editorData : null
        });

        const formValue = this.blogForm.value;
        const slug = formValue.id;

        // Generate automatic values
        const now = new Date().toISOString();

        const postData = {
          title: formValue.title,
          excerpt: this.generateExcerpt(editorData),
          content: formValue.content,
          date: now,
          category: 'Blog',
          readTime: this.calculateReadTime(editorData),
          imageUrl: this.extractFirstImage(editorData) || 'https://picsum.photos/800/400',
          author: 'Meet Joshi',
          galleryImages: [],
          published: formValue.published
        };

        const operation = this.isEditMode()
          ? from(this.dataService.updateBlogPost(slug, postData))
          : from(this.dataService.createBlogPost(slug, postData));

        operation.subscribe({
          next: () => {
            this.saving.set(false);
            this.router.navigate(['/admin/blog']);
          },
          error: (err) => {
            this.saving.set(false);
            this.error.set(`Failed to ${this.isEditMode() ? 'update' : 'create'} blog post`);
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

  private generateExcerpt(editorData: any): string {
    // Extract text from first paragraph or header
    if (editorData.blocks && editorData.blocks.length > 0) {
      for (const block of editorData.blocks) {
        if (block.type === 'paragraph' || block.type === 'header') {
          const text = block.data.text || '';
          // Strip HTML tags and truncate
          const plainText = text.replace(/<[^>]*>/g, '');
          return plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '');
        }
      }
    }
    return 'Read more...';
  }

  private calculateReadTime(editorData: any): string {
    // Estimate reading time based on word count
    let wordCount = 0;
    if (editorData.blocks) {
      editorData.blocks.forEach((block: any) => {
        if (block.type === 'paragraph' || block.type === 'header' || block.type === 'quote') {
          const text = (block.data.text || '').replace(/<[^>]*>/g, '');
          wordCount += text.split(/\s+/).length;
        }
      });
    }
    const minutes = Math.max(1, Math.ceil(wordCount / 200)); // Average reading speed
    return `${minutes} min read`;
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
    this.router.navigate(['/admin/blog']);
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editorJSService.destroyEditor(this.editor);
    }
  }
}
