import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';

const router = Router();
const authController = new AuthController();

router.post('/signin', (req, res) => authController.signIn(req, res));
router.post('/signout', (req, res) => authController.signOut(req, res));
router.get('/session', (req, res) => authController.getSession(req, res));

export default router;
