import { Router } from 'express';
import { StorageController, uploadMiddleware } from '../controllers/storage.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const storageController = new StorageController();

// All storage operations require authentication
router.post('/upload', authMiddleware, uploadMiddleware, (req, res) =>
  storageController.uploadImage(req, res)
);

router.delete('/:bucket/:path', authMiddleware, (req, res) =>
  storageController.deleteImage(req, res)
);

export default router;
