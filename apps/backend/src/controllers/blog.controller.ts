import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { supabaseAdmin } from '../config/supabase.js';
import { BlogPost, CreateBlogPostDto, UpdateBlogPostDto } from '@meetjoshi/shared';

export class BlogController {
  // Public: Get all published blog posts
  async getPublished(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { data, error } = await supabaseAdmin
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('date', { ascending: false });

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      res.json(this.mapBlogPosts(data || []));
    } catch (error: any) {
      console.error('Get blog posts error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Public: Get blog post by slug
  async getBySlug(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { slug } = req.params;

      const { data, error } = await supabaseAdmin
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error || !data) {
        res.status(404).json({ error: 'Blog post not found' });
        return;
      }

      res.json(this.mapBlogPost(data));
    } catch (error: any) {
      console.error('Get blog post error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Admin: Get all blog posts (including unpublished)
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { data, error } = await supabaseAdmin
        .from('blog_posts')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      res.json(this.mapBlogPosts(data || []));
    } catch (error: any) {
      console.error('Get all blog posts error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Admin: Create blog post
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const postData = req.body as CreateBlogPostDto;

      const { data, error } = await supabaseAdmin
        .from('blog_posts')
        .insert([{
          slug: postData.slug,
          title: postData.title,
          excerpt: postData.excerpt,
          content: postData.content,
          date: postData.date,
          category: postData.category,
          read_time: postData.readTime,
          image_url: postData.imageUrl,
          author: postData.author,
          gallery_images: postData.galleryImages,
          published: postData.published ?? true
        }])
        .select()
        .single();

      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      res.status(201).json(this.mapBlogPost(data));
    } catch (error: any) {
      console.error('Create blog post error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Admin: Update blog post
  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const updates = req.body as UpdateBlogPostDto;

      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.excerpt) dbUpdates.excerpt = updates.excerpt;
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.date) dbUpdates.date = updates.date;
      if (updates.category) dbUpdates.category = updates.category;
      if (updates.readTime) dbUpdates.read_time = updates.readTime;
      if (updates.imageUrl) dbUpdates.image_url = updates.imageUrl;
      if (updates.author !== undefined) dbUpdates.author = updates.author;
      if (updates.galleryImages !== undefined) dbUpdates.gallery_images = updates.galleryImages;
      if (updates.published !== undefined) dbUpdates.published = updates.published;

      const { data, error } = await supabaseAdmin
        .from('blog_posts')
        .update(dbUpdates)
        .eq('slug', slug)
        .select()
        .single();

      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      res.json(this.mapBlogPost(data));
    } catch (error: any) {
      console.error('Update blog post error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Admin: Delete blog post
  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { slug } = req.params;

      const { error } = await supabaseAdmin
        .from('blog_posts')
        .delete()
        .eq('slug', slug);

      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete blog post error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Map database schema to API response
  private mapBlogPost(data: any): BlogPost {
    return {
      id: data.slug,
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      date: data.date,
      category: data.category,
      readTime: data.read_time,
      imageUrl: data.image_url || '',
      author: data.author,
      galleryImages: data.gallery_images || [],
      published: data.published,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private mapBlogPosts(data: any[]): BlogPost[] {
    return data.map(item => this.mapBlogPost(item));
  }
}
