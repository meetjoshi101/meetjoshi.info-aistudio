import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { supabaseAdmin } from '../config/supabase.js';
import { Project, CreateProjectDto, UpdateProjectDto } from '@meetjoshi/shared';

export class ProjectsController {
  // Public: Get all published projects
  async getPublished(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { data, error } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      res.json(this.mapProjects(data || []));
    } catch (error: any) {
      console.error('Get projects error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Public: Get project by slug
  async getBySlug(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { slug } = req.params;

      const { data, error } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error || !data) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      res.json(this.mapProject(data));
    } catch (error: any) {
      console.error('Get project error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Admin: Get all projects (including unpublished)
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { data, error } = await supabaseAdmin
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      res.json(this.mapProjects(data || []));
    } catch (error: any) {
      console.error('Get all projects error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Admin: Create project
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const projectData = req.body as CreateProjectDto;

      const { data, error } = await supabaseAdmin
        .from('projects')
        .insert([{
          slug: projectData.slug,
          title: projectData.title,
          client: projectData.client,
          year: projectData.year,
          description: projectData.description,
          category: projectData.category,
          technologies: projectData.technologies,
          image_url: projectData.imageUrl,
          challenge: projectData.challenge,
          solution: projectData.solution,
          outcome: projectData.outcome,
          content: projectData.content,
          published: projectData.published ?? true
        }])
        .select()
        .single();

      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      res.status(201).json(this.mapProject(data));
    } catch (error: any) {
      console.error('Create project error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Admin: Update project
  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const updates = req.body as UpdateProjectDto;

      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.client !== undefined) dbUpdates.client = updates.client;
      if (updates.year !== undefined) dbUpdates.year = updates.year;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.category) dbUpdates.category = updates.category;
      if (updates.technologies) dbUpdates.technologies = updates.technologies;
      if (updates.imageUrl) dbUpdates.image_url = updates.imageUrl;
      if (updates.challenge !== undefined) dbUpdates.challenge = updates.challenge;
      if (updates.solution !== undefined) dbUpdates.solution = updates.solution;
      if (updates.outcome !== undefined) dbUpdates.outcome = updates.outcome;
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.published !== undefined) dbUpdates.published = updates.published;

      const { data, error } = await supabaseAdmin
        .from('projects')
        .update(dbUpdates)
        .eq('slug', slug)
        .select()
        .single();

      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      res.json(this.mapProject(data));
    } catch (error: any) {
      console.error('Update project error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Admin: Delete project
  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { slug } = req.params;

      const { error } = await supabaseAdmin
        .from('projects')
        .delete()
        .eq('slug', slug);

      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete project error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Map database schema to API response
  private mapProject(data: any): Project {
    return {
      id: data.slug,
      slug: data.slug,
      title: data.title,
      client: data.client,
      year: data.year,
      description: data.description,
      category: data.category,
      technologies: data.technologies || [],
      imageUrl: data.image_url || '',
      challenge: data.challenge,
      solution: data.solution,
      outcome: data.outcome,
      content: data.content,
      published: data.published,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private mapProjects(data: any[]): Project[] {
    return data.map(item => this.mapProject(item));
  }
}
