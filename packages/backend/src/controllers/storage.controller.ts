import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { supabaseAdmin } from '../config/supabase.js';
import multer from 'multer';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  }
});

export const uploadMiddleware = upload.single('file');

export class StorageController {
  async uploadImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      const { bucket } = req.body;

      if (!bucket || !['project-images', 'blog-images'].includes(bucket)) {
        res.status(400).json({ error: 'Invalid bucket name' });
        return;
      }

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${req.file.originalname}`;

      // Upload to Supabase Storage
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(filename, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      // Get public URL
      const { data: publicUrlData } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(filename);

      res.json({
        success: 1,
        file: {
          url: publicUrlData.publicUrl
        }
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { bucket, path } = req.params;

      if (!bucket || !['project-images', 'blog-images'].includes(bucket)) {
        res.status(400).json({ error: 'Invalid bucket name' });
        return;
      }

      const { error } = await supabaseAdmin.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
