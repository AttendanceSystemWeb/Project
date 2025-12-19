import express from 'express';
import * as adminController from '../controllers/adminController.js';
import * as authController from '../controllers/authController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

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

