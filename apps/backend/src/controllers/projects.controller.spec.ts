import { ProjectsController } from './projects.controller';
import { mockRequest, mockResponse } from '../__tests__/test-utils';
import { supabaseAdmin } from '../config/supabase';

jest.mock('../config/supabase.js');

describe('ProjectsController', () => {
  let projectsController: ProjectsController;
  let req: any;
  let res: any;

  const mockProject = {
    slug: 'test-project',
    title: 'Test Project',
    client: 'Test Client',
    year: 2024,
    description: 'Test description',
    category: 'Web Development',
    technologies: ['React', 'Node.js'],
    image_url: 'https://example.com/image.jpg',
    challenge: 'Test challenge',
    solution: 'Test solution',
    outcome: 'Test outcome',
    content: { blocks: [] },
    published: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  };

  beforeEach(() => {
    projectsController = new ProjectsController();
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  describe('getPublished', () => {
    it('should return all published projects', async () => {
      const mockData = [mockProject];

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockData,
          error: null
        })
      });

      await projectsController.getPublished(req, res);

      expect(supabaseAdmin.from).toHaveBeenCalledWith('projects');
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            slug: 'test-project',
            title: 'Test Project'
          })
        ])
      );
    });

    it('should return 500 on database error', async () => {
      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      });

      await projectsController.getPublished(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Database error'
      });
    });

    it('should handle errors gracefully', async () => {
      (supabaseAdmin.from as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await projectsController.getPublished(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });

  describe('getBySlug', () => {
    it('should return project by slug', async () => {
      req.params = { slug: 'test-project' };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProject,
          error: null
        })
      });

      await projectsController.getBySlug(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'test-project',
          title: 'Test Project'
        })
      );
    });

    it('should return 404 if project not found', async () => {
      req.params = { slug: 'non-existent' };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' }
        })
      });

      await projectsController.getBySlug(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Project not found'
      });
    });

    it('should handle errors gracefully', async () => {
      req.params = { slug: 'test-project' };

      (supabaseAdmin.from as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await projectsController.getBySlug(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });

  describe('getAll', () => {
    it('should return all projects including unpublished', async () => {
      const mockData = [mockProject, { ...mockProject, published: false }];

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockData,
          error: null
        })
      });

      await projectsController.getAll(req, res);

      expect(supabaseAdmin.from).toHaveBeenCalledWith('projects');
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ published: true }),
          expect.objectContaining({ published: false })
        ])
      );
    });

    it('should return 500 on database error', async () => {
      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      });

      await projectsController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Database error'
      });
    });
  });

  describe('create', () => {
    it('should create a new project', async () => {
      req.body = {
        slug: 'new-project',
        title: 'New Project',
        client: 'Client',
        year: 2024,
        description: 'Description',
        category: 'Web',
        technologies: ['React'],
        imageUrl: 'https://example.com/image.jpg',
        challenge: 'Challenge',
        solution: 'Solution',
        outcome: 'Outcome',
        content: { blocks: [] },
        published: true
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockProject, slug: 'new-project' },
          error: null
        })
      });

      await projectsController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'new-project'
        })
      );
    });

    it('should return 400 on validation error', async () => {
      req.body = {};

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Validation error' }
        })
      });

      await projectsController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation error'
      });
    });

    it('should handle errors gracefully', async () => {
      req.body = {};

      (supabaseAdmin.from as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await projectsController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      req.params = { slug: 'test-project' };
      req.body = {
        title: 'Updated Title',
        description: 'Updated description'
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockProject, title: 'Updated Title' },
          error: null
        })
      });

      await projectsController.update(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Title'
        })
      );
    });

    it('should return 400 on update error', async () => {
      req.params = { slug: 'test-project' };
      req.body = { title: 'Updated' };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Update error' }
        })
      });

      await projectsController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Update error'
      });
    });

    it('should handle errors gracefully', async () => {
      req.params = { slug: 'test-project' };
      req.body = {};

      (supabaseAdmin.from as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await projectsController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });

  describe('delete', () => {
    it('should delete a project', async () => {
      req.params = { slug: 'test-project' };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      });

      await projectsController.delete(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should return 400 on delete error', async () => {
      req.params = { slug: 'test-project' };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: { message: 'Delete error' }
        })
      });

      await projectsController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Delete error'
      });
    });

    it('should handle errors gracefully', async () => {
      req.params = { slug: 'test-project' };

      (supabaseAdmin.from as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await projectsController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });
});
