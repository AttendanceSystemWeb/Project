# Product Requirements Document (PRD)

## Product Name
Student Attendance Management System (SAMS)

## Version
1.1 (Brand-Aligned, Cursor-Ready)

---

## 1. Product Vision

SAMS is a web-based attendance management system designed to replace manual paper-based attendance in educational institutions. It enables administrators to manage school structure and teachers to efficiently record student attendance digitally, securely, and concurrently.

This PRD is written to be **clear, unambiguous, and implementation-ready**, optimized for development using **Cursor AI**.

---

## 2. Goals & Non-Goals

### 2.1 Goals
- Digitize and simplify attendance recording
- Support simultaneous usage by multiple teachers
- Ensure data accuracy, integrity, and security
- Provide administrators with full oversight
- Be deployable entirely using free-tier services

### 2.2 Non-Goals (v1)
- Parent or student portals
- Biometric or QR attendance
- Native mobile applications
- Offline-first support

---

## 3. User Roles

### 3.1 Admin
**Permissions:**
- Full system access
- Create and manage classes
- Create and manage subjects
- Add and manage students
- Create and manage teacher accounts
- Assign teachers to classes and subjects
- View and audit attendance records

### 3.2 Teacher
**Permissions:**
- Secure login
- View only assigned classes and subjects
- Record and submit attendance

---

## 4. Tech Stack (Final Decision)

### 4.1 Frontend
- React (Vite)
- Tailwind CSS
- Axios or Fetch API
- JWT-based authentication
- Deployment: **Vercel (Free Tier)**

### 4.2 Backend
- Node.js
- Express.js
- REST API architecture
- JWT authentication
- bcrypt for password hashing
- Deployment: **Railway or Render (Free Tier)**

### 4.3 Database
- Relational database
- PostgreSQL (preferred) or MySQL
- Hosted on **Supabase or Railway**

---

## 4.4 UI / UX Design System (Brand-Aligned)

### Background Policy
- The institute logo is **transparent**
- The application background must be **white by default**
- Dark mode is **out of scope for v1**

### Brand Colors

**Primary (Blue):**
```hex
#2F6497
```
Used for:
- Navigation bars
- Page headers
- Primary buttons
- Icons

**Accent (Orange):**
```hex
#F7931E
```
Used for:
- Submit / Save actions
- Active states
- Important highlights (e.g., absent students)

**Neutral UI Colors (Non-brand):**
```hex
#FFFFFF  // main background
#F9FAFB  // section background
#E5E7EB  // borders and dividers
#6B7280  // secondary text
#1F2937  // primary text
```

### Design Principles
- Clean, academic, and professional appearance
- White-first layout
- Minimal shadows
- No gradients or decorative colors
- High readability and accessibility
- Consistent spacing and alignment

### Typography
- Font family: **Inter** or **Roboto**
- Emphasis on readability over decorative styling

### UI Consistency Rules
- All pages must follow the defined color system
- No additional colors may be introduced
- Tailwind CSS utility classes only

---

## 5. System Architecture

```
Browser
  ↓
Frontend (React – Vercel)
  ↓ HTTPS + JWT
Backend (Express – Railway / Render)
  ↓ SQL
Database (PostgreSQL – Supabase)
```

---

## 6. User Flows

### 6.1 Admin Flow
1. Admin logs in
2. Creates classes
3. Creates subjects
4. Adds students to classes
5. Creates teacher accounts
6. Assigns teachers to class-subject pairs
7. Views attendance records

### 6.2 Teacher Flow
1. Teacher logs in
2. Selects assigned class
3. Selects assigned subject
4. Date defaults to current day
5. Student list loads automatically
6. Teacher marks absent students
7. Teacher submits attendance

---

## 7. Functional Requirements

### 7.1 Authentication
- All users must authenticate
- JWT issued upon successful login
- JWT contains user ID and role
- All protected routes require valid JWT

### 7.2 Attendance Rules
- One attendance session per:
  - teacher
  - class
  - subject
  - date
- Duplicate attendance submissions must be rejected

### 7.3 Multi-Teacher Handling
- Backend is stateless
- Each request authenticated via JWT
- Teacher access filtered by teacher ID
- Database enforces uniqueness and integrity

---

## 8. Frontend Architecture

### Pages
- /login
- /admin/dashboard
- /admin/classes
- /admin/students
- /admin/teachers
- /teacher/dashboard
- /teacher/attendance

### Key Components
- AuthProvider
- ProtectedRoute
- AttendanceForm
- StudentList
- AdminTables

---

## 9. Backend Architecture

### Layers
- Routes
- Controllers
- Services
- Middleware
- Database access layer

### Middleware
- JWT verification
- Role-based authorization
- Centralized error handling
- CORS configuration

---

## 10. Database Design (Conceptual)

### Core Tables
- users
- classes
- subjects
- students
- teacher_assignments
- attendance_sessions
- attendance_records

### Constraints
- Foreign keys enforced
- Unique constraint on attendance sessions
- Indexed foreign keys

---

## 11. Security Requirements

- Passwords hashed using bcrypt
- JWT expiration enforced
- Role-based access control
- Secrets stored in environment variables
- Frontend never accesses database directly

---

## 12. Deployment Strategy

### Independent Deployment
- Frontend → Vercel
- Backend → Railway / Render
- Database → Supabase / Railway

### Environment Variables

Frontend:
```env
VITE_API_URL=https://api.example.com
```

Backend:
```env
DATABASE_URL=...
JWT_SECRET=...
```

---

## 13. Non-Functional Requirements

- Supports at least 100 concurrent users
- Average API response time < 500ms
- First page load < 3 seconds

---

## 14. Acceptance Criteria

- Teachers can record attendance successfully
- Admin can view attendance history
- Teachers cannot access other teachers’ data
- Duplicate attendance entries are prevented

---

## 15. Final Summary

SAMS is a clean, scalable, and secure attendance management platform designed for real educational use. The system architecture, UI design, and authentication model are clearly defined to enable efficient development using Cursor AI and modern web technologies.

