# Deployment Guide

Complete guide for deploying SAMS to production using free-tier services.

## Overview

- **Frontend:** Vercel (Free Tier)
- **Backend:** Railway or Render (Free Tier)
- **Database:** Supabase or Railway (Free Tier)

---

## 1. Database Setup (Supabase)

### Step 1: Create Database

1. Go to [supabase.com](https://supabase.com)
2. Sign up / Sign in
3. Click "New Project"
4. Fill in:
   - Project name: `sams-db`
   - Database password: (generate strong password)
   - Region: Choose closest to your users
5. Wait for database to provision (~2 minutes)

### Step 2: Run Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy contents from `database/schema.sql`
4. Paste and click "Run"
5. Verify tables are created in **Table Editor**

### Step 3: Get Connection String

1. Go to **Settings** → **Database**
2. Find "Connection string" section
3. Copy the **URI** (Connection Pooling)
4. Format: `postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres`
5. Save this - you'll need it for backend

### Step 4: Create Production Admin User

Since the default hash in schema.sql won't work, you need to create admin with proper hash:

1. Generate bcrypt hash for your password:
   ```bash
   node -e "console.log(require('bcrypt').hashSync('YOUR_SECURE_PASSWORD', 10))"
   ```

2. In Supabase SQL Editor, run:
   ```sql
   DELETE FROM users WHERE username = 'admin';
   INSERT INTO users (username, password_hash, full_name, role) 
   VALUES ('admin', 'YOUR_BCRYPT_HASH_HERE', 'System Administrator', 'admin');
   ```

---

## 2. Backend Deployment (Railway)

### Step 1: Prepare Repository

1. Ensure your code is on GitHub
2. Commit all changes
3. Push to main branch

### Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up / Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Select your repository
6. Click "Add variables" to add environment variables

### Step 3: Configure Environment Variables

Add these variables in Railway:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
NODE_ENV=production
PORT=5000
```

**Generate secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Configure Build Settings

1. Go to **Settings** tab
2. Set **Root Directory:** `backend`
3. Set **Build Command:** `npm install`
4. Set **Start Command:** `npm start`
5. Click "Deploy"

### Step 5: Get Backend URL

1. Go to **Settings** → **Domains**
2. Click "Generate Domain"
3. Copy the URL (e.g., `https://your-app.up.railway.app`)
4. Save this for frontend configuration

### Step 6: Verify Deployment

Visit: `https://your-app.up.railway.app/health`

Should return: `{"status":"OK","timestamp":"..."}`

---

## 3. Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up / Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import your repository
5. Configure project:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Step 2: Add Environment Variable

Before deploying, add:

1. Click "Environment Variables"
2. Add variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-backend-url.up.railway.app/api`
3. Click "Deploy"

### Step 3: Get Frontend URL

After deployment completes:
- Vercel provides URL like: `https://your-app.vercel.app`
- You can also add custom domain in settings

---

## Alternative: Backend on Render

### Deploy to Render

1. Go to [render.com](https://render.com)
2. Sign up / Sign in with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository
5. Configure:
   - **Name:** sams-backend
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

### Add Environment Variables

In "Environment" tab, add:
```
DATABASE_URL=...
JWT_SECRET=...
NODE_ENV=production
```

---

## 4. Post-Deployment Setup

### Step 1: Test Admin Login

1. Visit your frontend URL
2. Login with admin credentials
3. Verify dashboard loads correctly

### Step 2: Create Initial Data

As admin:
1. Create 2-3 classes
2. Create 2-3 subjects
3. Add sample students
4. Create a teacher account
5. Assign teacher to class-subject

### Step 3: Test Teacher Flow

1. Logout from admin
2. Login as teacher
3. Verify assignments appear
4. Record attendance
5. Check attendance history

### Step 4: Verify Admin Can View Records

1. Login as admin again
2. Go to "Attendance Records"
3. Verify teacher's submission appears

---

## 5. Security Checklist

- [ ] Changed default admin password
- [ ] Using strong JWT_SECRET (32+ characters)
- [ ] Database password is secure
- [ ] No `.env` files in repository
- [ ] All environment variables set correctly
- [ ] CORS configured properly in backend
- [ ] SSL/HTTPS enabled (automatic on Vercel/Railway)

---

## 6. Monitoring & Maintenance

### Railway Monitoring
- View logs in Railway dashboard
- Monitor resource usage
- Check deployment status

### Vercel Monitoring
- View deployment logs
- Check build status
- Monitor function invocations

### Database Maintenance (Supabase)
- Monitor storage usage
- Check query performance
- Regular backups (automatic)

---

## 7. Troubleshooting

### Backend Not Connecting to Database

**Issue:** Backend logs show database connection errors

**Solution:**
1. Verify DATABASE_URL is correct
2. Check Supabase database is running
3. Ensure IP whitelist allows connections (Supabase: set to 0.0.0.0/0 for Railway)
4. Test connection string format

### Frontend Can't Reach Backend

**Issue:** API calls fail with network errors

**Solution:**
1. Verify VITE_API_URL is correct
2. Ensure backend is deployed and healthy
3. Check backend CORS configuration
4. Test backend health endpoint directly

### Authentication Issues

**Issue:** Login fails or token rejected

**Solution:**
1. Verify JWT_SECRET is set on backend
2. Check admin user exists in database
3. Ensure password hash is correct
4. Clear browser localStorage and retry

### Database Tables Missing

**Issue:** API errors about missing tables

**Solution:**
1. Verify schema.sql was executed completely
2. Check Supabase table editor for all tables
3. Re-run schema if needed
4. Check database name in connection string

---

## 8. Costs & Limits (Free Tier)

### Vercel Free Tier
- 100 GB bandwidth/month
- Unlimited deployments
- Custom domains supported

### Railway Free Tier
- $5 credit/month
- 500 hours execution time
- 1 GB memory per service

### Supabase Free Tier
- 500 MB database space
- Unlimited API requests
- 2 GB bandwidth

**Note:** For production use with many users, consider upgrading to paid tiers.

---

## 9. Scaling Considerations

When you outgrow free tiers:

1. **Upgrade Database First**
   - More storage and connections
   - Better performance

2. **Upgrade Backend**
   - More memory and CPU
   - Auto-scaling

3. **Consider CDN**
   - Faster frontend delivery
   - Better global performance

---

## 10. Backup Strategy

### Database Backups
- Supabase: Automatic daily backups (paid tier)
- Manual: Use `pg_dump` to export database

### Code Backups
- Git repository is your source of truth
- Tag releases for easy rollback

### Environment Variables
- Store securely (password manager)
- Document all variables
- Version control .env.example (never .env)

---

## Support

For deployment issues:
- Check service status pages
- Review error logs
- Consult service documentation
- Check GitHub Issues

---

**Good luck with your deployment! 🚀**

