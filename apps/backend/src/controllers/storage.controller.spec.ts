import { StorageController } from './storage.controller';
import { mockRequest, mockResponse } from '../__tests__/test-utils';
import { supabaseAdmin } from '../config/supabase';

jest.mock('../config/supabase.js');

describe('StorageController', () => {
  let storageController: StorageController;
  let req: any;
  let res: any;

  beforeEach(() => {
    storageController = new StorageController();
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('should return 400 if no file is provided', async () => {
      req.file = undefined;

      await storageController.uploadImage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No file provided'
      });
    });

    it('should return 400 if bucket is invalid', async () => {
      req.file = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg'
      };
      req.body = { bucket: 'invalid-bucket' };

      await storageController.uploadImage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid bucket name'
      });
    });

    it('should return 400 if bucket is missing', async () => {
      req.file = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg'
      };
      req.body = {};

      await storageController.uploadImage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid bucket name'
      });
    });

    it('should upload image successfully to project-images bucket', async () => {
      req.file = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg'
      };
      req.body = { bucket: 'project-images' };

      const mockUpload = jest.fn().mockResolvedValue({
        data: { path: '123-test.jpg' },
        error: null
      });

      const mockGetPublicUrl = jest.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/123-test.jpg' }
      });

      (supabaseAdmin.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl
      });

      await storageController.uploadImage(req, res);

      expect(supabaseAdmin.storage.from).toHaveBeenCalledWith('project-images');
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringContaining('test.jpg'),
        req.file.buffer,
        expect.objectContaining({
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        })
      );
      expect(res.json).toHaveBeenCalledWith({
        success: 1,
        file: {
          url: 'https://example.com/123-test.jpg'
        }
      });
    });

    it('should upload image successfully to blog-images bucket', async () => {
      req.file = {
        originalname: 'blog.png',
        buffer: Buffer.from('test'),
        mimetype: 'image/png'
      };
      req.body = { bucket: 'blog-images' };

      const mockUpload = jest.fn().mockResolvedValue({
        data: { path: '456-blog.png' },
        error: null
      });

      const mockGetPublicUrl = jest.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/456-blog.png' }
      });

      (supabaseAdmin.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl
      });

      await storageController.uploadImage(req, res);

      expect(supabaseAdmin.storage.from).toHaveBeenCalledWith('blog-images');
      expect(res.json).toHaveBeenCalledWith({
        success: 1,
        file: {
          url: 'https://example.com/456-blog.png'
        }
      });
    });

    it('should return 500 on upload error', async () => {
      req.file = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg'
      };
      req.body = { bucket: 'project-images' };

      (supabaseAdmin.storage.from as jest.Mock).mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Upload failed' }
        })
      });

      await storageController.uploadImage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Upload failed'
      });
    });

    it('should handle errors gracefully', async () => {
      req.file = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg'
      };
      req.body = { bucket: 'project-images' };

      (supabaseAdmin.storage.from as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await storageController.uploadImage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });

  describe('deleteImage', () => {
    it('should return 400 if bucket is invalid', async () => {
      req.params = { bucket: 'invalid-bucket', path: 'test.jpg' };

      await storageController.deleteImage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid bucket name'
      });
    });

    it('should delete image successfully from project-images bucket', async () => {
      req.params = { bucket: 'project-images', path: '123-test.jpg' };

      (supabaseAdmin.storage.from as jest.Mock).mockReturnValue({
        remove: jest.fn().mockResolvedValue({
          error: null
        })
      });

      await storageController.deleteImage(req, res);

      expect(supabaseAdmin.storage.from).toHaveBeenCalledWith('project-images');
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should delete image successfully from blog-images bucket', async () => {
      req.params = { bucket: 'blog-images', path: '456-blog.png' };

      (supabaseAdmin.storage.from as jest.Mock).mockReturnValue({
        remove: jest.fn().mockResolvedValue({
          error: null
        })
      });

      await storageController.deleteImage(req, res);

      expect(supabaseAdmin.storage.from).toHaveBeenCalledWith('blog-images');
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should return 500 on delete error', async () => {
      req.params = { bucket: 'project-images', path: 'test.jpg' };

      (supabaseAdmin.storage.from as jest.Mock).mockReturnValue({
        remove: jest.fn().mockResolvedValue({
          error: { message: 'Delete failed' }
        })
      });

      await storageController.deleteImage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Delete failed'
      });
    });

    it('should handle errors gracefully', async () => {
      req.params = { bucket: 'project-images', path: 'test.jpg' };

      (supabaseAdmin.storage.from as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await storageController.deleteImage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });
});
