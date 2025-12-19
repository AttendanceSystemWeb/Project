# 🚀 Quick Start

Get SAMS running in 5 minutes!

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Setup

### 1. Install Dependencies

```bash
# From project root
npm run install-all
```

### 2. Setup Database

```bash
# Create database
psql -U postgres -c "CREATE DATABASE sams_db;"

# Load schema
psql -U postgres -d sams_db -f database/schema.sql
```

### 3. Configure Environment

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sams_db
JWT_SECRET=dev-secret-key
PORT=5000
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run Application

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

### 5. Login

Open http://localhost:3000

**Admin:** `admin` / `admin123`

---

## First Steps

1. Create classes
2. Create subjects
3. Add students
4. Create teachers
5. Assign teachers to classes
6. Login as teacher and record attendance

---

**Need help?** Check `SETUP_GUIDE.md` for detailed instructions.

