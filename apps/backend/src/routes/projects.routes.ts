import { Router } from 'express';
import { ProjectsController } from '../controllers/projects.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const projectsController = new ProjectsController();

// Public routes
router.get('/', (req, res) => projectsController.getPublished(req, res));
router.get('/:slug', (req, res) => projectsController.getBySlug(req, res));

// Admin routes (protected)
router.get('/admin/all', authMiddleware, (req, res) => projectsController.getAll(req, res));
router.post('/admin', authMiddleware, (req, res) => projectsController.create(req, res));
router.put('/admin/:slug', authMiddleware, (req, res) => projectsController.update(req, res));
router.delete('/admin/:slug', authMiddleware, (req, res) => projectsController.delete(req, res));

export default router;
