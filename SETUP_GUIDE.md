# Quick Setup Guide

Step-by-step guide to get SAMS running on your local machine in 10 minutes.

## Prerequisites

Before starting, install:
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL 14+](https://www.postgresql.org/download/)
- [Git](https://git-scm.com/)

---

## Step 1: Clone & Verify (1 min)

```bash
# Clone or navigate to project
cd "Attendance System (Web)"

# Verify structure
ls
# Should see: backend/ frontend/ database/ README.md
```

---

## Step 2: Database Setup (2 min)

### Create Database

```bash
# Open PostgreSQL
psql -U postgres

# In PostgreSQL prompt:
CREATE DATABASE sams_db;
\q
```

### Load Schema

```bash
# Load schema into database
psql -U postgres -d sams_db -f database/schema.sql
```

### Verify Tables

```bash
psql -U postgres -d sams_db

# List tables
\dt

# Should see 7 tables:
# - users
# - classes
# - subjects
# - students
# - teacher_assignments
# - attendance_sessions
# - attendance_records

\q
```

---

## Step 3: Backend Setup (2 min)

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sams_db
JWT_SECRET=dev-secret-key-change-in-production
PORT=5000
NODE_ENV=development
EOF

# Note: Adjust password in DATABASE_URL if your PostgreSQL password is different
```

---

## Step 4: Frontend Setup (2 min)

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF
```

---

## Step 5: Start Backend (1 min)

Open a new terminal:

```bash
cd backend
npm run dev
```

**Expected output:**
```
✓ Server running on port 5000
✓ Environment: development
✓ Database connected successfully
```

**If you see errors:**
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Ensure database and schema exist

---

## Step 6: Start Frontend (1 min)

Open another terminal:

```bash
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

---

## Step 7: Access Application (1 min)

1. Open browser: http://localhost:3000
2. You should see the login page with Tishk logo

### Login with default admin:
- Username: `admin`
- Password: `admin123`

🎉 **Success!** You should now see the Admin Dashboard.

---

## Step 8: Quick Test (2 min)

Let's verify everything works:

### As Admin:

1. **Create a Class**
   - Navigate to "Classes"
   - Click "+ Add Class"
   - Name: "Test Class", Code: "TC01"
   - Save

2. **Create a Subject**
   - Navigate to "Subjects"
   - Click "+ Add Subject"
   - Name: "Mathematics", Code: "MATH"
   - Save

3. **Add a Student**
   - Navigate to "Students"
   - Click "+ Add Student"
   - Name: "John Doe", ID: "S001", Class: "Test Class"
   - Save

4. **Create a Teacher**
   - Navigate to "Teachers"
   - Click "+ Add Teacher"
   - Full Name: "Jane Smith", Username: "teacher1", Password: "test123"
   - Save

5. **Create Assignment**
   - Navigate to "Assignments"
   - Click "+ Add Assignment"
   - Teacher: "Jane Smith", Class: "Test Class", Subject: "Mathematics"
   - Save

### As Teacher:

6. **Logout and Login as Teacher**
   - Logout (top right)
   - Login: `teacher1` / `test123`

7. **Record Attendance**
   - You should see your assignment
   - Click "Record Attendance"
   - Select class and subject
   - Click on "John Doe" to mark absent
   - Submit

8. **View History**
   - Navigate to "History"
   - You should see the attendance record you just submitted

### Verify as Admin:

9. **Logout and Login as Admin**
   - Logout
   - Login as admin again

10. **Check Attendance Records**
    - Navigate to "Attendance Records"
    - You should see the teacher's submission
    - Click to expand and see student details

✅ **All tests passed!** Your system is fully functional.

---

## Troubleshooting

### Backend won't start

**Error:** `ECONNREFUSED` or database connection error

**Fix:**
```bash
# Check PostgreSQL is running
pg_isready

# If not running, start it:
# macOS:
brew services start postgresql

# Linux:
sudo systemctl start postgresql

# Windows:
# Start "PostgreSQL" service from Services app
```

**Error:** `password authentication failed`

**Fix:**
Edit `backend/.env` with correct PostgreSQL password

---

### Frontend won't start

**Error:** `Cannot find module`

**Fix:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

### Login fails

**Error:** "Invalid credentials"

**Fix:**
1. Check backend is running
2. Verify admin user exists:
   ```bash
   psql -U postgres -d sams_db
   SELECT username, role FROM users;
   ```
3. If admin doesn't exist, re-run schema.sql

---

### Port already in use

**Error:** `Port 5000 is already in use`

**Fix:**
```bash
# Find process using port
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or change port in backend/.env
PORT=5001
```

---

## Next Steps

Now that your system is running:

1. **Read the README.md** - Full documentation
2. **Check DEPLOYMENT.md** - Deploy to production
3. **Review PRD** - Understand all features
4. **Customize** - Adapt to your needs

---

## Project Structure Quick Reference

```
backend/
├── src/
│   ├── config/         # Database connection
│   ├── controllers/    # Handle requests
│   ├── services/       # Business logic
│   ├── routes/         # API endpoints
│   ├── middleware/     # Auth & errors
│   └── server.js       # Main server file
└── package.json

frontend/
├── src/
│   ├── pages/          # All page components
│   │   ├── admin/      # Admin pages
│   │   └── teacher/    # Teacher pages
│   ├── components/     # Shared components
│   ├── context/        # Auth context
│   ├── services/       # API calls
│   ├── App.jsx         # Routes
│   └── main.jsx        # Entry point
└── package.json

database/
└── schema.sql          # Database structure
```

---

## Quick Commands Reference

```bash
# Backend
cd backend
npm run dev          # Start development server
npm start            # Start production server

# Frontend  
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Database
psql -U postgres -d sams_db                    # Connect
psql -U postgres -d sams_db -f schema.sql      # Run schema
pg_dump sams_db > backup.sql                   # Backup
```

---

## Getting Help

1. Check error messages carefully
2. Review relevant section in README.md
3. Inspect browser console (F12)
4. Check backend terminal logs
5. Verify database contents with psql

---

**Happy coding! 🎓**

