import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService, BlogPost } from '../../services/data.service';
import { SupabaseService } from '../../services/supabase.service';
import { from } from 'rxjs';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="px-4 sm:px-0">
      <div class="mb-6">
        <h2 class="text-2xl font-serif text-stone-900">{{ isEditMode() ? 'Edit Blog Post' : 'New Blog Post' }}</h2>
      </div>

      @if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {{ error() }}
        </div>
      }

      <form [formGroup]="blogForm" (ngSubmit)="onSubmit()" class="bg-white shadow rounded-lg p-6 space-y-6">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <!-- Title -->
          <div class="md:col-span-2">
            <label for="title" class="block text-sm font-medium text-stone-700">Title *</label>
            <input
              id="title"
              type="text"
              formControlName="title"
              class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-3 py-2 border"
              placeholder="Blog post title"
            />
            @if (blogForm.get('title')?.invalid && blogForm.get('title')?.touched) {
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
              placeholder="blog-post-slug"
            />
            @if (blogForm.get('id')?.invalid && blogForm.get('id')?.touched) {
              <p class="mt-1 text-sm text-red-600">Slug is required</p>
            }
          </div>

          <!-- Category -->
          <div>
            <label for="category" class="block text-sm font-medium text-stone-700">Category *</label>
            <input
              id="category"
              type="text"
              formControlName="category"
              class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-3 py-2 border"
              placeholder="e.g., Development, Design, Tutorial"
            />
            @if (blogForm.get('category')?.invalid && blogForm.get('category')?.touched) {
              <p class="mt-1 text-sm text-red-600">Category is required</p>
            }
          </div>

          <!-- Author -->
          <div>
            <label for="author" class="block text-sm font-medium text-stone-700">Author</label>
            <input
              id="author"
              type="text"
              formControlName="author"
              class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-3 py-2 border"
              placeholder="Meet Joshi"
            />
          </div>

          <!-- Date -->
          <div>
            <label for="date" class="block text-sm font-medium text-stone-700">Date *</label>
            <input
              id="date"
              type="date"
              formControlName="date"
              class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-3 py-2 border"
            />
            @if (blogForm.get('date')?.invalid && blogForm.get('date')?.touched) {
              <p class="mt-1 text-sm text-red-600">Date is required</p>
            }
          </div>

          <!-- Read Time -->
          <div>
            <label for="readTime" class="block text-sm font-medium text-stone-700">Read Time *</label>
            <input
              id="readTime"
              type="text"
              formControlName="readTime"
              class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-3 py-2 border"
              placeholder="5 min read"
            />
            @if (blogForm.get('readTime')?.invalid && blogForm.get('readTime')?.touched) {
              <p class="mt-1 text-sm text-red-600">Read time is required</p>
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

          <!-- Excerpt -->
          <div class="md:col-span-2">
            <label for="excerpt" class="block text-sm font-medium text-stone-700">Excerpt *</label>
            <textarea
              id="excerpt"
              formControlName="excerpt"
              rows="3"
              class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-3 py-2 border"
              placeholder="Brief excerpt for the blog post"
            ></textarea>
            @if (blogForm.get('excerpt')?.invalid && blogForm.get('excerpt')?.touched) {
              <p class="mt-1 text-sm text-red-600">Excerpt is required</p>
            }
          </div>

          <!-- Image Upload -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-stone-700">Featured Image *</label>
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
            @if (blogForm.get('imageUrl')?.invalid && blogForm.get('imageUrl')?.touched) {
              <p class="mt-1 text-sm text-red-600">Image is required</p>
            }
          </div>

          <!-- Gallery Images -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-stone-700 mb-2">Gallery Images (Optional)</label>
            <div class="space-y-2">
              @for (url of galleryImages(); track $index; let i = $index) {
                <div class="flex gap-2 items-center">
                  <img [src]="url" alt="Gallery" class="h-10 w-10 object-cover rounded">
                  <span class="flex-1 text-sm text-stone-600 truncate">{{ url }}</span>
                  <button
                    type="button"
                    (click)="removeGalleryImage(i)"
                    class="px-3 py-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              }
            </div>
            <input
              type="file"
              (change)="onGalleryImageChange($event)"
              accept="image/*"
              class="mt-2 block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
            />
            @if (uploadingGalleryImage()) {
              <p class="mt-1 text-sm text-amber-600">Uploading gallery image...</p>
            }
          </div>

          <!-- Content (HTML) -->
          <div class="md:col-span-2">
            <label for="content" class="block text-sm font-medium text-stone-700">
              Content (HTML) *
            </label>
            <textarea
              id="content"
              formControlName="content"
              rows="12"
              class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-3 py-2 border font-mono text-xs"
              placeholder="<h2>Section Title</h2><p>Content here...</p>"
            ></textarea>
            @if (blogForm.get('content')?.invalid && blogForm.get('content')?.touched) {
              <p class="mt-1 text-sm text-red-600">Content is required</p>
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
            [disabled]="blogForm.invalid || saving()"
            class="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ saving() ? 'Saving...' : (isEditMode() ? 'Update Post' : 'Create Post') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class BlogFormComponent implements OnInit {
  blogForm: FormGroup;
  isEditMode = signal(false);
  saving = signal(false);
  uploadingImage = signal(false);
  uploadingGalleryImage = signal(false);
  error = signal('');
  currentImageUrl = signal('');
  galleryImages = signal<string[]>([]);
  postId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private supabaseService: SupabaseService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.blogForm = this.fb.group({
      id: ['', Validators.required],
      title: ['', Validators.required],
      excerpt: ['', Validators.required],
      content: ['', Validators.required],
      date: ['', Validators.required],
      category: ['', Validators.required],
      readTime: ['', Validators.required],
      imageUrl: ['', Validators.required],
      author: ['Meet Joshi'],
      published: [false]
    });
  }

  ngOnInit() {
    this.postId = this.route.snapshot.paramMap.get('id');

    if (this.postId) {
      this.isEditMode.set(true);
      this.loadBlogPost(this.postId);
    } else {
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      this.blogForm.patchValue({ date: today });
    }
  }

  private loadBlogPost(id: string) {
    this.dataService.getAllBlogPosts().subscribe({
      next: (posts) => {
        const post = posts.find(p => p.id === id);
        if (post) {
          this.currentImageUrl.set(post.imageUrl);
          this.galleryImages.set(post.galleryImages || []);

          // Convert date format (assuming it's stored as formatted string)
          const dateValue = post.date;

          this.blogForm.patchValue({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt,
            content: post.content || '',
            date: dateValue,
            category: post.category,
            readTime: post.readTime,
            imageUrl: post.imageUrl,
            author: post.author || 'Meet Joshi',
            published: post.published || false
          });
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

  async onImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.uploadingImage.set(true);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name}`;
      const imageUrl = await this.supabaseService.uploadImage('blog-images', file, filename);
      this.blogForm.patchValue({ imageUrl });
      this.currentImageUrl.set(imageUrl);
      this.uploadingImage.set(false);
    } catch (error) {
      this.error.set('Failed to upload image');
      this.uploadingImage.set(false);
      console.error('Upload error:', error);
    }
  }

  async onGalleryImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.uploadingGalleryImage.set(true);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name}`;
      const imageUrl = await this.supabaseService.uploadImage('blog-images', file, filename);
      this.galleryImages.update(images => [...images, imageUrl]);
      this.uploadingGalleryImage.set(false);
      // Clear the file input
      input.value = '';
    } catch (error) {
      this.error.set('Failed to upload gallery image');
      this.uploadingGalleryImage.set(false);
      console.error('Upload error:', error);
    }
  }

  removeGalleryImage(index: number) {
    this.galleryImages.update(images => images.filter((_, i) => i !== index));
  }

  onSubmit() {
    if (this.blogForm.valid) {
      this.saving.set(true);
      this.error.set('');

      const formValue = this.blogForm.value;
      const slug = formValue.id;
      const postData = {
        title: formValue.title,
        excerpt: formValue.excerpt,
        content: formValue.content,
        date: formValue.date,
        category: formValue.category,
        readTime: formValue.readTime,
        imageUrl: formValue.imageUrl,
        author: formValue.author,
        galleryImages: this.galleryImages(),
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
    }
  }

  onCancel() {
    this.router.navigate(['/admin/blog']);
  }
}
