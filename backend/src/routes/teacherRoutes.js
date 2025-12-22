import express from 'express';
import * as teacherController from '../controllers/teacherController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Handle OPTIONS requests for all teacher routes (CORS preflight)
router.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(204).end();
});

// All teacher routes require authentication and teacher role
router.use(authenticateToken, authorizeRole('teacher'));

router.get('/assignments', teacherController.getAssignments);
router.get('/students', teacherController.getStudents);
router.post('/attendance', teacherController.submitAttendance);
router.get('/attendance/history', teacherController.getAttendanceHistory);

export default router;

