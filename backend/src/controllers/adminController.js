import * as adminService from '../services/adminService.js';

// Classes
export const getClasses = async (req, res, next) => {
  try {
    const classes = await adminService.getAllClasses();
    res.json(classes);
  } catch (error) {
    next(error);
  }
};

export const createClass = async (req, res, next) => {
  try {
    const { className, classCode } = req.body;
    if (!className || !classCode) {
      return res.status(400).json({ error: 'Class name and code are required' });
    }
    const newClass = await adminService.createClass(className, classCode);
    res.status(201).json(newClass);
  } catch (error) {
    next(error);
  }
};

export const deleteClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    await adminService.deleteClass(id);
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Subjects
export const getSubjects = async (req, res, next) => {
  try {
    const subjects = await adminService.getAllSubjects();
    res.json(subjects);
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const { subjectName, subjectCode } = req.body;
    if (!subjectName || !subjectCode) {
      return res.status(400).json({ error: 'Subject name and code are required' });
    }
    const newSubject = await adminService.createSubject(subjectName, subjectCode);
    res.status(201).json(newSubject);
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    await adminService.deleteSubject(id);
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Students
export const getStudents = async (req, res, next) => {
  try {
    const { classId } = req.query;
    const students = classId 
      ? await adminService.getStudentsByClass(classId)
      : await adminService.getAllStudents();
    res.json(students);
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (req, res, next) => {
  try {
    const { studentName, studentId, classId } = req.body;
    if (!studentName || !studentId || !classId) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const newStudent = await adminService.createStudent(studentName, studentId, classId);
    res.status(201).json(newStudent);
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    await adminService.deleteStudent(id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Teachers
export const getTeachers = async (req, res, next) => {
  try {
    const teachers = await adminService.getAllTeachers();
    res.json(teachers);
  } catch (error) {
    next(error);
  }
};

export const deleteTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    await adminService.deleteTeacher(id);
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Assignments
export const getAssignments = async (req, res, next) => {
  try {
    const { teacherId } = req.query;
    const assignments = teacherId
      ? await adminService.getTeacherAssignments(teacherId)
      : await adminService.getAllAssignments();
    res.json(assignments);
  } catch (error) {
    next(error);
  }
};

export const createAssignment = async (req, res, next) => {
  try {
    const { teacherId, classId, subjectId } = req.body;
    if (!teacherId || !classId || !subjectId) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const assignment = await adminService.createAssignment(teacherId, classId, subjectId);
    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
};

export const deleteAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await adminService.deleteAssignment(id);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Attendance records viewing
export const getAttendanceRecords = async (req, res, next) => {
  try {
    const { classId, subjectId, date } = req.query;
    const records = await adminService.getAttendanceRecords({ classId, subjectId, date });
    res.json(records);
  } catch (error) {
    next(error);
  }
};

// Student attendance statistics
export const getStudentAttendanceStats = async (req, res, next) => {
  try {
    const { classId, subjectId, startDate, endDate } = req.query;
    const stats = await adminService.getStudentAttendanceStats({ 
      classId, 
      subjectId, 
      startDate, 
      endDate 
    });
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

