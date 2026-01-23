import { BlogController } from './blog.controller';
import { mockRequest, mockResponse } from '../__tests__/test-utils';
import { supabaseAdmin } from '../config/supabase';

jest.mock('../config/supabase.js');

describe('BlogController', () => {
  let blogController: BlogController;
  let req: any;
  let res: any;

  const mockBlogPost = {
    slug: 'test-post',
    title: 'Test Post',
    excerpt: 'Test excerpt',
    content: { blocks: [] },
    date: '2024-01-01',
    category: 'Technology',
    read_time: 5,
    image_url: 'https://example.com/image.jpg',
    author: 'Test Author',
    gallery_images: ['https://example.com/img1.jpg'],
    published: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  };

  beforeEach(() => {
    blogController = new BlogController();
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  describe('getPublished', () => {
    it('should return all published blog posts', async () => {
      const mockData = [mockBlogPost];

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockData,
          error: null
        })
      });

      await blogController.getPublished(req, res);

      expect(supabaseAdmin.from).toHaveBeenCalledWith('blog_posts');
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            slug: 'test-post',
            title: 'Test Post'
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

      await blogController.getPublished(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Database error'
      });
    });

    it('should handle errors gracefully', async () => {
      (supabaseAdmin.from as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await blogController.getPublished(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });

  describe('getBySlug', () => {
    it('should return blog post by slug', async () => {
      req.params = { slug: 'test-post' };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockBlogPost,
          error: null
        })
      });

      await blogController.getBySlug(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'test-post',
          title: 'Test Post'
        })
      );
    });

    it('should return 404 if blog post not found', async () => {
      req.params = { slug: 'non-existent' };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' }
        })
      });

      await blogController.getBySlug(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Blog post not found'
      });
    });

    it('should handle errors gracefully', async () => {
      req.params = { slug: 'test-post' };

      (supabaseAdmin.from as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await blogController.getBySlug(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });

  describe('getAll', () => {
    it('should return all blog posts including unpublished', async () => {
      const mockData = [mockBlogPost, { ...mockBlogPost, published: false }];

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockData,
          error: null
        })
      });

      await blogController.getAll(req, res);

      expect(supabaseAdmin.from).toHaveBeenCalledWith('blog_posts');
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

      await blogController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Database error'
      });
    });
  });

  describe('create', () => {
    it('should create a new blog post', async () => {
      req.body = {
        slug: 'new-post',
        title: 'New Post',
        excerpt: 'Excerpt',
        content: { blocks: [] },
        date: '2024-01-01',
        category: 'Tech',
        readTime: 5,
        imageUrl: 'https://example.com/image.jpg',
        author: 'Author',
        galleryImages: [],
        published: true
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockBlogPost, slug: 'new-post' },
          error: null
        })
      });

      await blogController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'new-post'
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

      await blogController.create(req, res);

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

      await blogController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });

  describe('update', () => {
    it('should update a blog post', async () => {
      req.params = { slug: 'test-post' };
      req.body = {
        title: 'Updated Title',
        excerpt: 'Updated excerpt'
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockBlogPost, title: 'Updated Title' },
          error: null
        })
      });

      await blogController.update(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Title'
        })
      );
    });

    it('should return 400 on update error', async () => {
      req.params = { slug: 'test-post' };
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

      await blogController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Update error'
      });
    });

    it('should handle errors gracefully', async () => {
      req.params = { slug: 'test-post' };
      req.body = {};

      (supabaseAdmin.from as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await blogController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });

  describe('delete', () => {
    it('should delete a blog post', async () => {
      req.params = { slug: 'test-post' };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      });

      await blogController.delete(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should return 400 on delete error', async () => {
      req.params = { slug: 'test-post' };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: { message: 'Delete error' }
        })
      });

      await blogController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Delete error'
      });
    });

    it('should handle errors gracefully', async () => {
      req.params = { slug: 'test-post' };

      (supabaseAdmin.from as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await blogController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });
});
