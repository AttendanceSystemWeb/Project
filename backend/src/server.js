import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import pool from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Helper function to set CORS headers
const setCORSHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // CRITICAL: Prevent caching of responses to avoid stale CORS failures
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
};

// Explicit OPTIONS handler for all routes (backup - handles preflight requests)
app.options('*', (req, res) => {
  setCORSHeaders(res);
  res.status(204).end();
});

// Middleware - CORS configuration (MUST be first, before any other middleware)
app.use((req, res, next) => {
  setCORSHeaders(res);
  
  // Handle preflight requests immediately
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

// Body parser middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  setCORSHeaders(res);
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/users', userRoutes);

// Debug logging
console.log('✓ Routes registered:');
console.log('  - /api/auth');
console.log('  - /api/admin');
console.log('  - /api/teacher');
console.log('  - /api/users');

// Test route for debugging
app.get('/api/test', (req, res) => {
  setCORSHeaders(res);
  res.json({ message: 'API routes are working!' });
});

// Error handling middleware (must be after routes)
app.use(errorHandler);

// 404 handler (must be last)
app.use((req, res) => {
  setCORSHeaders(res);
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Server accessible at http://0.0.0.0:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await pool.end();
  process.exit(0);
});