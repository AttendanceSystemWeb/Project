import express from 'express';
import * as adminController from '../controllers/adminController.js';
import * as authController from '../controllers/authController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Handle OPTIONS requests FIRST (before auth middleware)
router.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(204).end();
});

// All admin routes require authentication and admin role
router.use(authenticateToken, authorizeRole('admin'));

// Classes
router.get('/classes', adminController.getClasses);
router.post('/classes', adminController.createClass);
router.delete('/classes/:id', adminController.deleteClass);

// Subjects
router.get('/subjects', adminController.getSubjects);
router.post('/subjects', adminController.createSubject);
router.delete('/subjects/:id', adminController.deleteSubject);

// Students
router.get('/students', adminController.getStudents);
router.post('/students', adminController.createStudent);
router.delete('/students/:id', adminController.deleteStudent);

// Teachers
router.get('/teachers', adminController.getTeachers);
router.post('/teachers', authController.createTeacher);
router.delete('/teachers/:id', adminController.deleteTeacher);

// Assignments
router.get('/assignments', adminController.getAssignments);
router.post('/assignments', adminController.createAssignment);
router.delete('/assignments/:id', adminController.deleteAssignment);

// Attendance records
router.get('/attendance', adminController.getAttendanceRecords);
router.get('/attendance/student-stats', adminController.getStudentAttendanceStats);

export default router;

