import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user info
router.get('/:userId', userController.getUserInfo);

// Update user credentials (username/password)
router.put('/:userId/credentials', userController.updateCredentials);

export default router;

