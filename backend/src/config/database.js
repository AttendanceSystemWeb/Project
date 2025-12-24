import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Connection pool configuration for Supabase free tier (max 15-20 connections)
  max: 10, // Maximum 10 connections in pool (safe for free tier)
  min: 2,  // Keep 2 connections alive for faster responses
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 10000, // Wait max 10 seconds for connection
  // Handle query timeouts
  statement_timeout: 30000, // Kill queries running longer than 30 seconds
});

// Test database connection
pool.on('connect', () => {
  console.log('✓ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
  process.exit(-1);
});

export default pool;

