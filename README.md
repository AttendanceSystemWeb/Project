# Student Attendance Management System (SAMS)

A production-ready web-based attendance management system for educational institutions. Built with React, Node.js, Express, and PostgreSQL.

## 🎯 Features

### Admin Features
- Complete system management dashboard
- Manage classes, subjects, and students
- Create and manage teacher accounts
- Assign teachers to class-subject combinations
- View and audit all attendance records
- Real-time statistics and reporting

### Teacher Features
- Secure authentication
- View assigned classes and subjects
- Record student attendance efficiently
- View attendance history
- Prevent duplicate submissions

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **JWT** authentication

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- **bcrypt** for password hashing
- **JWT** for authentication
- RESTful API architecture

## 🎨 Design System

- **Primary Color:** `#2F6497` (Blue)
- **Accent Color:** `#F7931E` (Orange)
- **Background:** White
- **Font:** Inter / Roboto
- Clean, academic, professional design

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Attendance System (Web)"
```

### 2. Database Setup

Create a PostgreSQL database and run the schema:

```bash
psql -U postgres
CREATE DATABASE sams_db;
\c sams_db
\i database/schema.sql
```

### 3. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

**Backend .env file:**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/sams_db
JWT_SECRET=your-very-secure-secret-key-change-this
PORT=5000
NODE_ENV=development
```

### 4. Frontend Setup

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env
```

**Frontend .env file:**
```env
VITE_API_URL=http://localhost:5000/api
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 🔐 Default Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANT:** Change the default admin password immediately in production!

## 📦 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set root directory to `frontend`
4. Set build command: `npm run build`
5. Add environment variable:
   - `VITE_API_URL=https://your-backend-url.com/api`

### Backend (Railway / Render)

1. Create new project
2. Connect GitHub repository
3. Set root directory to `backend`
4. Add environment variables:
   - `DATABASE_URL` (from database service)
   - `JWT_SECRET` (generate secure key)
   - `NODE_ENV=production`
   - `PORT` (usually auto-set)

### Database (Supabase / Railway)

1. Create PostgreSQL database
2. Run the schema from `database/schema.sql`
3. Copy connection string to backend `DATABASE_URL`

## 📁 Project Structure

```
Attendance System (Web)/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth & error handling
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── server.js       # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # Admin pages
│   │   │   └── teacher/    # Teacher pages
│   │   ├── services/       # API service
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   └── package.json
│
├── database/
│   └── schema.sql          # Database schema
│
└── README.md
```

## 🔒 Security Features

- Password hashing with bcrypt (10 rounds)
- JWT-based authentication
- Role-based access control (RBAC)
- SQL injection protection (parameterized queries)
- CORS configuration
- Secure environment variables
- Token expiration (24 hours)

## 📝 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (authenticated)

### Admin Endpoints (Require admin role)
- **Classes:** `GET|POST /api/admin/classes`, `DELETE /api/admin/classes/:id`
- **Subjects:** `GET|POST /api/admin/subjects`, `DELETE /api/admin/subjects/:id`
- **Students:** `GET|POST /api/admin/students`, `DELETE /api/admin/students/:id`
- **Teachers:** `GET|POST /api/admin/teachers`, `DELETE /api/admin/teachers/:id`
- **Assignments:** `GET|POST /api/admin/assignments`, `DELETE /api/admin/assignments/:id`
- **Attendance:** `GET /api/admin/attendance`

### Teacher Endpoints (Require teacher role)
- `GET /api/teacher/assignments` - Get teacher's assignments
- `GET /api/teacher/students` - Get students for class-subject
- `POST /api/teacher/attendance` - Submit attendance
- `GET /api/teacher/attendance/history` - View history

## 🧪 Testing the System

### 1. Admin Workflow
1. Login with admin credentials
2. Create classes (e.g., "Grade 10 A", code "G10A")
3. Create subjects (e.g., "Mathematics", code "MATH101")
4. Add students to classes
5. Create teacher accounts
6. Assign teachers to class-subject pairs

### 2. Teacher Workflow
1. Login with teacher credentials
2. Select assigned class and subject
3. Mark student attendance (all present by default)
4. Submit attendance
5. View attendance history

## 📊 Database Schema

### Core Tables
- **users** - Admin and teacher accounts
- **classes** - Class information
- **subjects** - Subject information
- **students** - Student records
- **teacher_assignments** - Teacher-class-subject mapping
- **attendance_sessions** - Attendance session metadata
- **attendance_records** - Individual student attendance

### Key Constraints
- Unique constraint on attendance sessions (teacher, class, subject, date)
- Foreign key relationships with cascade delete
- Indexed columns for performance

## ⚡ Performance Considerations

- Database queries optimized with indexes
- JWT for stateless authentication
- Efficient React component structure
- Lazy loading for better initial load time
- Responsive design for mobile devices

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists and schema is loaded

### Frontend API Issues
- Check VITE_API_URL points to correct backend
- Verify backend is running
- Check browser console for CORS errors

### Authentication Issues
- Verify JWT_SECRET is set in backend
- Check token expiration (24 hours)
- Clear browser localStorage and re-login

## 📄 License

MIT License - Feel free to use for educational purposes

## 👥 Support

For issues and questions:
1. Check this documentation
2. Review the PRD (Product Requirements Document)
3. Inspect browser console for errors
4. Check backend logs for API errors

## 🔄 Future Enhancements (Not in v1)

- Parent/student portals
- Biometric attendance
- Mobile applications
- Offline support
- Advanced analytics
- Export to Excel/PDF
- Email notifications
- Dark mode

---

**Built with ❤️ for educational institutions**

