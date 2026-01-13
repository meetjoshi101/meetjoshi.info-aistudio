import { Router } from 'express';
import authRoutes from './auth.routes.js';
import projectsRoutes from './projects.routes.js';
import blogRoutes from './blog.routes.js';
import storageRoutes from './storage.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectsRoutes);
router.use('/blog', blogRoutes);
router.use('/storage', storageRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
