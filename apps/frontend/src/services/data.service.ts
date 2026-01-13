import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { ApiService } from './api.service';
import { Project, BlogPost, CreateProjectDto, UpdateProjectDto, CreateBlogPostDto, UpdateBlogPostDto } from '@meetjoshi/shared';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiService = inject(ApiService);

  // Signals to track data source
  dataSource = signal<'API' | 'Error'>('API');
  projectsSource = signal<string>('API');

  // --- Project Methods ---

  getProjects(): Observable<Project[]> {
    return this.apiService.get<Project[]>('/projects').pipe(
      map(projects => {
        this.projectsSource.set('API');
        return projects;
      }),
      catchError(err => {
        console.error('Projects API Error', err);
        this.projectsSource.set('Error');
        return of([]);
      })
    );
  }

  getProjectBySlug(slug: string): Observable<Project | undefined> {
    return this.apiService.get<Project>(`/projects/${slug}`).pipe(
      catchError(err => {
        console.error('Get project error:', err);
        return of(undefined);
      })
    );
  }

  // --- Blog Methods ---

  getBlogPosts(): Observable<BlogPost[]> {
    return this.apiService.get<BlogPost[]>('/blog').pipe(
      map(posts => {
        this.dataSource.set('API');
        return posts;
      }),
      catchError(error => {
        console.error('Error fetching from API:', error);
        this.dataSource.set('Error');
        return of([]);
      })
    );
  }

  getBlogPostBySlug(slug: string): Observable<BlogPost | undefined> {
    return this.apiService.get<BlogPost>(`/blog/${slug}`).pipe(
      catchError(error => {
        console.error('Error fetching post detail:', error);
        return of(undefined);
      })
    );
  }

  // --- Admin Methods (for viewing all content including unpublished) ---

  getAllProjects(): Observable<Project[]> {
    return this.apiService.get<Project[]>('/projects/admin/all', true).pipe(
      catchError(err => {
        console.error('Projects API Error', err);
        return of([]);
      })
    );
  }

  getAllBlogPosts(): Observable<BlogPost[]> {
    return this.apiService.get<BlogPost[]>('/blog/admin/all', true).pipe(
      catchError(error => {
        console.error('Error fetching from API:', error);
        return of([]);
      })
    );
  }

  // --- Admin Methods (for creating content) ---

  async createProject(slug: string, project: Omit<Project, 'id' | 'slug'>): Promise<Project | null> {
    try {
      const dto: CreateProjectDto = {
        slug,
        title: project.title,
        client: project.client,
        year: project.year,
        description: project.description,
        category: project.category,
        technologies: project.technologies,
        imageUrl: project.imageUrl,
        challenge: project.challenge,
        solution: project.solution,
        outcome: project.outcome,
        content: project.content,
        published: project.published ?? true
      };

      return await this.apiService.post<Project>('/projects/admin', dto, true).toPromise() || null;
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  }

  async updateProject(slug: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      const dto: UpdateProjectDto = {};

      if (updates.title) dto.title = updates.title;
      if (updates.client !== undefined) dto.client = updates.client;
      if (updates.year !== undefined) dto.year = updates.year;
      if (updates.description) dto.description = updates.description;
      if (updates.category) dto.category = updates.category;
      if (updates.technologies) dto.technologies = updates.technologies;
      if (updates.imageUrl) dto.imageUrl = updates.imageUrl;
      if (updates.challenge !== undefined) dto.challenge = updates.challenge;
      if (updates.solution !== undefined) dto.solution = updates.solution;
      if (updates.outcome !== undefined) dto.outcome = updates.outcome;
      if (updates.content !== undefined) dto.content = updates.content;
      if (updates.published !== undefined) dto.published = updates.published;

      return await this.apiService.put<Project>(`/projects/admin/${slug}`, dto, true).toPromise() || null;
    } catch (error) {
      console.error('Error updating project:', error);
      return null;
    }
  }

  async deleteProject(slug: string): Promise<boolean> {
    try {
      await this.apiService.delete<{ success: boolean }>(`/projects/admin/${slug}`, true).toPromise();
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }

  async createBlogPost(slug: string, post: Omit<BlogPost, 'id' | 'slug'>): Promise<BlogPost | null> {
    try {
      const dto: CreateBlogPostDto = {
        slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        date: post.date,
        category: post.category,
        readTime: post.readTime,
        imageUrl: post.imageUrl,
        author: post.author,
        galleryImages: post.galleryImages,
        published: post.published ?? true
      };

      return await this.apiService.post<BlogPost>('/blog/admin', dto, true).toPromise() || null;
    } catch (error) {
      console.error('Error creating blog post:', error);
      return null;
    }
  }

  async updateBlogPost(slug: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
    try {
      const dto: UpdateBlogPostDto = {};

      if (updates.title) dto.title = updates.title;
      if (updates.excerpt) dto.excerpt = updates.excerpt;
      if (updates.content !== undefined) dto.content = updates.content;
      if (updates.date) dto.date = updates.date;
      if (updates.category) dto.category = updates.category;
      if (updates.readTime) dto.readTime = updates.readTime;
      if (updates.imageUrl) dto.imageUrl = updates.imageUrl;
      if (updates.author !== undefined) dto.author = updates.author;
      if (updates.galleryImages !== undefined) dto.galleryImages = updates.galleryImages;
      if (updates.published !== undefined) dto.published = updates.published;

      return await this.apiService.put<BlogPost>(`/blog/admin/${slug}`, dto, true).toPromise() || null;
    } catch (error) {
      console.error('Error updating blog post:', error);
      return null;
    }
  }

  async deleteBlogPost(slug: string): Promise<boolean> {
    try {
      await this.apiService.delete<{ success: boolean }>(`/blog/admin/${slug}`, true).toPromise();
      return true;
    } catch (error) {
      console.error('Error deleting blog post:', error);
      return false;
    }
  }
}
