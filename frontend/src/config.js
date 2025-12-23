// Use relative path in production (Netlify will proxy to backend)
// This makes requests appear same-origin, avoiding ad blockers
// For local development, use VITE_API_URL env variable or it will default to relative path
const isProduction = import.meta.env.PROD;
const envApiUrl = import.meta.env.VITE_API_URL;

// In production (Netlify), use relative path for proxy
// In development, use env variable or localhost fallback
export const API_URL = isProduction && !envApiUrl
  ? '/api'  // Production: Use Netlify proxy
  : (envApiUrl || 'http://localhost:5000/api');  // Development: Use env or localhost

