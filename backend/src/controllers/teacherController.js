import * as teacherService from '../services/teacherService.js';

export const getAssignments = async (req, res, next) => {
  try {
    const teacherId = req.user.userId;
    const assignments = await teacherService.getTeacherAssignments(teacherId);
    res.json(assignments);
  } catch (error) {
    next(error);
  }
};

export const getStudents = async (req, res, next) => {
  try {
    const teacherId = req.user.userId;
    const { classId, subjectId } = req.query;

    if (!classId || !subjectId) {
      return res.status(400).json({ error: 'Class ID and Subject ID are required' });
    }

    const students = await teacherService.getStudentsForAttendance(
      teacherId,
      classId,
      subjectId
    );
    res.json(students);
  } catch (error) {
    next(error);
  }
};

export const submitAttendance = async (req, res, next) => {
  try {
    const teacherId = req.user.userId;
    const { classId, subjectId, date, attendance, lectureStartTime, lectureEndTime } = req.body;

    if (!classId || !subjectId || !date || !attendance) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!Array.isArray(attendance) || attendance.length === 0) {
      return res.status(400).json({ error: 'Attendance data must be a non-empty array' });
    }

    const result = await teacherService.submitAttendance(
      teacherId,
      classId,
      subjectId,
      date,
      attendance,
      lectureStartTime,
      lectureEndTime
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAttendanceHistory = async (req, res, next) => {
  try {
    const teacherId = req.user.userId;
    const { classId, subjectId } = req.query;
    const history = await teacherService.getTeacherAttendanceHistory(teacherId, {
      classId,
      subjectId
    });
    res.json(history);
  } catch (error) {
    next(error);
  }
};

