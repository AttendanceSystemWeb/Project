import express from 'express';
import cors from 'cors';
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

// CORS helper function
const setCORSHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
};

// CORS middleware for all requests (MUST be first, before any other middleware)
app.use((req, res, next) => {
  // Always set CORS headers first
  setCORSHeaders(res);
  
  // Handle preflight requests immediately - return before any other processing
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

// Explicit OPTIONS handler for all routes (backup)
app.options('*', (req, res) => {
  setCORSHeaders(res);
  res.status(204).end();
});

// Also use cors package as backup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
  credentials: false,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Body parser middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
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
  res.json({ message: 'API routes are working!' });
});

// CORS test endpoint (no auth required)
app.get('/api/cors-test', (req, res) => {
  res.json({ 
    message: 'CORS test successful',
    headers: {
      'Access-Control-Allow-Origin': res.getHeader('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': res.getHeader('Access-Control-Allow-Methods')
    }
  });
});

app.options('/api/cors-test', (req, res) => {
  setCORSHeaders(res);
  res.status(204).end();
});

// Error handling middleware (must be after routes)
app.use(errorHandler);

// 404 handler (must be last)
app.use((req, res) => {
  // CRITICAL: Set CORS headers even for 404 responses
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