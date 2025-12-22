import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Handle OPTIONS requests for all user routes (CORS preflight)
router.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(204).end();
});

// All routes require authentication
router.use(authenticateToken);

// Get user info
router.get('/:userId', userController.getUserInfo);

// Update user credentials (username/password)
router.put('/:userId/credentials', userController.updateCredentials);

export default router;

