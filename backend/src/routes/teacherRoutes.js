import express from 'express';
import * as teacherController from '../controllers/teacherController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All teacher routes require authentication and teacher role
router.use(authenticateToken, authorizeRole('teacher'));

router.get('/assignments', teacherController.getAssignments);
router.get('/students', teacherController.getStudents);
router.post('/attendance', teacherController.submitAttendance);
router.get('/attendance/history', teacherController.getAttendanceHistory);

export default router;

