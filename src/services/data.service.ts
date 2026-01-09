import { Injectable, inject, signal } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { EditorJSData } from '../types/editorjs.types';

export interface Project {
  id: string;
  title: string;
  client?: string;
  year?: string;
  description: string;
  category: string;
  technologies: string[];
  imageUrl: string;
  challenge?: string;
  solution?: string;
  outcome?: string;
  content?: EditorJSData | null;
  published?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content?: EditorJSData | null;
  date: string;
  category: string;
  readTime: string;
  imageUrl: string;
  author?: string;
  galleryImages?: string[];
  published?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private supabase = inject(SupabaseService);

  // Signals to track data source
  dataSource = signal<'Supabase' | 'Error'>('Supabase');
  projectsSource = signal<string>('Supabase');

  // --- Project Methods ---

  getProjects(): Observable<Project[]> {
    return from(
      this.supabase.client
        .from('projects')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching projects:', error);
          this.projectsSource.set('Error');
          return [];
        }
        this.projectsSource.set('Supabase');
        return (data || []).map(this.mapProjectFromDb);
      }),
      catchError(err => {
        console.error('Projects API Error', err);
        this.projectsSource.set('Error');
        return of([]);
      })
    );
  }

  getProjectBySlug(slug: string): Observable<Project | undefined> {
    return from(
      this.supabase.client
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error || !data) {
          console.error('Error fetching project:', error);
          return undefined;
        }
        return this.mapProjectFromDb(data);
      }),
      catchError(err => {
        console.error(err);
        return of(undefined);
      })
    );
  }

  // --- Blog Methods ---

  getBlogPosts(): Observable<BlogPost[]> {
    return from(
      this.supabase.client
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('date', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching blog posts:', error);
          this.dataSource.set('Error');
          return [];
        }
        this.dataSource.set('Supabase');
        return (data || []).map(this.mapBlogPostFromDb);
      }),
      catchError(error => {
        console.error('Error fetching from Supabase:', error);
        this.dataSource.set('Error');
        return of([]);
      })
    );
  }

  getBlogPostBySlug(slug: string): Observable<BlogPost | undefined> {
    return from(
      this.supabase.client
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error || !data) {
          console.error('Error fetching blog post:', error);
          return undefined;
        }
        return this.mapBlogPostFromDb(data);
      }),
      catchError(error => {
        console.error('Error fetching post detail:', error);
        return of(undefined);
      })
    );
  }

  // --- Admin Methods (for viewing all content including unpublished) ---

  getAllProjects(): Observable<Project[]> {
    return from(
      this.supabase.client
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching all projects:', error);
          return [];
        }
        return (data || []).map(this.mapProjectFromDb);
      }),
      catchError(err => {
        console.error('Projects API Error', err);
        return of([]);
      })
    );
  }

  getAllBlogPosts(): Observable<BlogPost[]> {
    return from(
      this.supabase.client
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching all blog posts:', error);
          return [];
        }
        return (data || []).map(this.mapBlogPostFromDb);
      }),
      catchError(error => {
        console.error('Error fetching from Supabase:', error);
        return of([]);
      })
    );
  }

  // --- Admin Methods (for creating content) ---

  async createProject(slug: string, project: Omit<Project, 'id' | 'slug'>): Promise<Project | null> {
    const { data, error } = await this.supabase.client
      .from('projects')
      .insert([{
        slug: slug,
        title: project.title,
        client: project.client,
        year: project.year,
        description: project.description,
        category: project.category,
        technologies: project.technologies,
        image_url: project.imageUrl,
        challenge: project.challenge,
        solution: project.solution,
        outcome: project.outcome,
        content: project.content,
        published: project.published ?? true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return null;
    }
    return this.mapProjectFromDb(data);
  }

  async updateProject(slug: string, updates: Partial<Project>): Promise<Project | null> {
    const dbUpdates: any = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.client) dbUpdates.client = updates.client;
    if (updates.year) dbUpdates.year = updates.year;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.category) dbUpdates.category = updates.category;
    if (updates.technologies) dbUpdates.technologies = updates.technologies;
    if (updates.imageUrl) dbUpdates.image_url = updates.imageUrl;
    if (updates.challenge) dbUpdates.challenge = updates.challenge;
    if (updates.solution) dbUpdates.solution = updates.solution;
    if (updates.outcome) dbUpdates.outcome = updates.outcome;
    if (updates.content) dbUpdates.content = updates.content;
    if (updates.published !== undefined) dbUpdates.published = updates.published;

    const { data, error } = await this.supabase.client
      .from('projects')
      .update(dbUpdates)
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      return null;
    }
    return this.mapProjectFromDb(data);
  }

  async deleteProject(slug: string): Promise<boolean> {
    const { error } = await this.supabase.client
      .from('projects')
      .delete()
      .eq('slug', slug);

    if (error) {
      console.error('Error deleting project:', error);
      return false;
    }
    return true;
  }

  async createBlogPost(slug: string, post: Omit<BlogPost, 'id' | 'slug'>): Promise<BlogPost | null> {
    const { data, error } = await this.supabase.client
      .from('blog_posts')
      .insert([{
        slug: slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        date: post.date,
        category: post.category,
        read_time: post.readTime,
        image_url: post.imageUrl,
        author: post.author || 'Meet Joshi',
        gallery_images: post.galleryImages || [],
        published: post.published ?? true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating blog post:', error);
      return null;
    }
    return this.mapBlogPostFromDb(data);
  }

  async updateBlogPost(slug: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
    const dbUpdates: any = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.excerpt) dbUpdates.excerpt = updates.excerpt;
    if (updates.content) dbUpdates.content = updates.content;
    if (updates.date) dbUpdates.date = updates.date;
    if (updates.category) dbUpdates.category = updates.category;
    if (updates.readTime) dbUpdates.read_time = updates.readTime;
    if (updates.imageUrl) dbUpdates.image_url = updates.imageUrl;
    if (updates.author) dbUpdates.author = updates.author;
    if (updates.galleryImages) dbUpdates.gallery_images = updates.galleryImages;
    if (updates.published !== undefined) dbUpdates.published = updates.published;

    const { data, error } = await this.supabase.client
      .from('blog_posts')
      .update(dbUpdates)
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      console.error('Error updating blog post:', error);
      return null;
    }
    return this.mapBlogPostFromDb(data);
  }

  async deleteBlogPost(slug: string): Promise<boolean> {
    const { error } = await this.supabase.client
      .from('blog_posts')
      .delete()
      .eq('slug', slug);

    if (error) {
      console.error('Error deleting blog post:', error);
      return false;
    }
    return true;
  }

  // --- Mappers (convert database schema to app interfaces) ---

  private mapProjectFromDb(data: any): Project {
    // Ensure content is valid EditorJS data or null
    let content: EditorJSData | null = null;
    if (data.content) {
      // Validate it has the required structure
      if (typeof data.content === 'object' &&
          data.content.blocks &&
          Array.isArray(data.content.blocks)) {
        content = data.content as EditorJSData;
      } else {
        // Content is malformed, log warning
        console.warn('Invalid content structure for project:', data.slug);
      }
    }

    return {
      id: data.slug,
      slug: data.slug,
      title: data.title,
      client: data.client,
      year: data.year,
      description: data.description,
      category: data.category,
      technologies: data.technologies || [],
      imageUrl: data.image_url || 'https://picsum.photos/800/600',
      challenge: data.challenge,
      solution: data.solution,
      outcome: data.outcome,
      content: content,
      published: data.published
    } as Project;
  }

  private mapBlogPostFromDb(data: any): BlogPost {
    // Format date if it's an ISO string
    let formattedDate = data.date;
    if (typeof data.date === 'string' && data.date.includes('T')) {
      formattedDate = new Date(data.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }

    // Ensure excerpt is always a string
    let excerpt = data.excerpt;
    if (typeof excerpt !== 'string') {
      // Generate from content blocks if excerpt is corrupted
      if (data.content && data.content.blocks && Array.isArray(data.content.blocks)) {
        for (const block of data.content.blocks) {
          if (block.type === 'paragraph' || block.type === 'header') {
            const text = block.data?.text || '';
            // Strip HTML tags and truncate
            const plainText = text.replace(/<[^>]*>/g, '');
            if (plainText.length > 0) {
              excerpt = plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '');
              break;
            }
          }
        }
      }
      // Final fallback
      if (typeof excerpt !== 'string' || excerpt.length === 0) {
        excerpt = 'Read more...';
      }
    }

    // Ensure content is valid EditorJS data or null
    let content: EditorJSData | null = null;
    if (data.content) {
      // Validate it has the required structure
      if (typeof data.content === 'object' &&
          data.content.blocks &&
          Array.isArray(data.content.blocks)) {
        content = data.content as EditorJSData;
      } else {
        // Content is malformed, log warning
        console.warn('Invalid content structure for blog post:', data.slug);
      }
    }

    return {
      id: data.slug,
      slug: data.slug,
      title: data.title,
      excerpt: excerpt,
      content: content,
      date: formattedDate,
      category: data.category,
      readTime: data.read_time || '5 min read',
      imageUrl: data.image_url || 'https://picsum.photos/800/400',
      author: data.author || 'Meet Joshi',
      galleryImages: data.gallery_images || [],
      published: data.published
    } as BlogPost;
  }
}
