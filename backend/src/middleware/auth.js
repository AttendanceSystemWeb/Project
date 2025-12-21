import jwt from 'jsonwebtoken';

// Helper function to ensure CORS headers are set
const ensureCORSHeaders = (res) => {
  // CORS headers should already be set by server middleware, but ensure they're there
  if (!res.getHeader('Access-Control-Allow-Origin')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Authorization');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }
};

export const authenticateToken = (req, res, next) => {
  // Skip authentication for OPTIONS requests (CORS preflight)
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    ensureCORSHeaders(res);
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (error) {
    ensureCORSHeaders(res);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    // Skip authorization for OPTIONS requests (CORS preflight)
    if (req.method === 'OPTIONS') {
      return next();
    }

    if (!req.user) {
      ensureCORSHeaders(res);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      ensureCORSHeaders(res);
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

