# Netlify Proxy Setup - Ad Blocker Solution

## Overview

This solution uses Netlify's proxy feature to route all API requests through the Netlify domain, making them appear as same-origin requests. This completely avoids ad blocker issues and CORS problems.

## How It Works

1. **Frontend makes request to:** `https://your-app.netlify.app/api/auth/login`
2. **Netlify proxies to:** `https://site--sams-backend--zj5y5bs2dc2g.code.run/api/auth/login`
3. **Ad blockers see:** Same-origin request (no blocking!)
4. **Browser sees:** Same-origin request (no CORS!)

## Changes Made

### 1. `frontend/public/_redirects`
Added proxy rule:
```
/api/*  https://site--sams-backend--zj5y5bs2dc2g.code.run/api/:splat  200
```

### 2. `frontend/src/config.js`
- In production: Uses relative path `/api` (Netlify proxy)
- In development: Uses `VITE_API_URL` env variable or `http://localhost:5000/api`

### 3. `frontend/src/services/api.js`
- Updated fetch mode to `same-origin` when using relative URLs
- Updated CORS health check to handle proxied requests
- Updated retry logic to use correct mode

### 4. `frontend/src/context/AuthContext.jsx`
- Updated health check request to use correct mode based on URL type

## Benefits

✅ **No Ad Blocker Issues** - Requests appear same-origin
✅ **No CORS Issues** - Same-origin requests don't need CORS
✅ **Free Solution** - Uses Netlify's built-in proxy feature
✅ **No Code Changes Needed** - Works automatically after deployment
✅ **Backward Compatible** - Still works in development with localhost

## Testing

### Production (Netlify)
1. Deploy to Netlify
2. All API calls will automatically go through proxy
3. Check browser Network tab - requests should show `your-app.netlify.app` domain
4. Ad blockers should not interfere

### Development
1. Set `VITE_API_URL=http://localhost:5000/api` in `.env`
2. Or leave unset to use default localhost
3. Works normally with local backend

## Important Notes

- **Backend URL:** Make sure the backend URL in `_redirects` matches your actual Northflank URL
- **Environment Variables:** You can remove `VITE_API_URL` from Netlify environment variables (it's not needed anymore)
- **Local Development:** Still works with `VITE_API_URL` set to localhost

## Troubleshooting

### Requests Still Failing
1. Verify `_redirects` file is in `frontend/public/` directory
2. Check Netlify deployment logs for proxy errors
3. Verify backend URL in `_redirects` is correct
4. Clear browser cache and hard refresh

### Development Not Working
1. Make sure `VITE_API_URL` is set in `.env` file
2. Or set it to `http://localhost:5000/api`
3. Restart dev server after changing `.env`

## Next Steps

1. Commit these changes
2. Push to GitHub
3. Netlify will automatically redeploy
4. Test the application - ad blockers should no longer interfere!

