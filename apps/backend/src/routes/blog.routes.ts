import { Router } from 'express';
import { BlogController } from '../controllers/blog.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const blogController = new BlogController();

// Public routes
router.get('/', (req, res) => blogController.getPublished(req, res));
router.get('/:slug', (req, res) => blogController.getBySlug(req, res));

// Admin routes (protected)
router.get('/admin/all', authMiddleware, (req, res) => blogController.getAll(req, res));
router.post('/admin', authMiddleware, (req, res) => blogController.create(req, res));
router.put('/admin/:slug', authMiddleware, (req, res) => blogController.update(req, res));
router.delete('/admin/:slug', authMiddleware, (req, res) => blogController.delete(req, res));

export default router;
