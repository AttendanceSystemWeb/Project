import pool from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

// Classes
export const getAllClasses = async () => {
  const result = await pool.query('SELECT * FROM classes ORDER BY class_name');
  return result.rows;
};

export const createClass = async (className, classCode) => {
  try {
    const result = await pool.query(
      'INSERT INTO classes (class_name, class_code) VALUES ($1, $2) RETURNING *',
      [className, classCode]
    );
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError('Class code already exists', 400);
    }
    throw error;
  }
};

export const deleteClass = async (classId) => {
  const result = await pool.query('DELETE FROM classes WHERE id = $1 RETURNING *', [classId]);
  if (result.rows.length === 0) {
    throw new AppError('Class not found', 404);
  }
  return result.rows[0];
};

// Subjects
export const getAllSubjects = async () => {
  const result = await pool.query('SELECT * FROM subjects ORDER BY subject_name');
  return result.rows;
};

export const createSubject = async (subjectName, subjectCode) => {
  try {
    const result = await pool.query(
      'INSERT INTO subjects (subject_name, subject_code) VALUES ($1, $2) RETURNING *',
      [subjectName, subjectCode]
    );
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError('Subject code already exists', 400);
    }
    throw error;
  }
};

export const deleteSubject = async (subjectId) => {
  const result = await pool.query('DELETE FROM subjects WHERE id = $1 RETURNING *', [subjectId]);
  if (result.rows.length === 0) {
    throw new AppError('Subject not found', 404);
  }
  return result.rows[0];
};

// Students
export const getAllStudents = async () => {
  const result = await pool.query(`
    SELECT s.*, c.class_name, c.class_code 
    FROM students s
    JOIN classes c ON s.class_id = c.id
    ORDER BY c.class_name, s.student_name
  `);
  return result.rows;
};

export const getStudentsByClass = async (classId) => {
  const result = await pool.query(
    'SELECT * FROM students WHERE class_id = $1 ORDER BY student_name',
    [classId]
  );
  return result.rows;
};

export const createStudent = async (studentName, studentId, classId) => {
  try {
    const result = await pool.query(
      'INSERT INTO students (student_name, student_id, class_id) VALUES ($1, $2, $3) RETURNING *',
      [studentName, studentId, classId]
    );
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError('Student ID already exists', 400);
    }
    throw error;
  }
};

export const deleteStudent = async (studentId) => {
  const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [studentId]);
  if (result.rows.length === 0) {
    throw new AppError('Student not found', 404);
  }
  return result.rows[0];
};

// Teachers
export const getAllTeachers = async () => {
  const result = await pool.query(
    "SELECT id, username, full_name, created_at FROM users WHERE role = 'teacher' ORDER BY full_name"
  );
  return result.rows;
};

export const deleteTeacher = async (teacherId) => {
  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 AND role = 'teacher' RETURNING id, username, full_name",
    [teacherId]
  );
  if (result.rows.length === 0) {
    throw new AppError('Teacher not found', 404);
  }
  return result.rows[0];
};

// Teacher Assignments
export const getTeacherAssignments = async (teacherId) => {
  const result = await pool.query(`
    SELECT ta.*, c.class_name, c.class_code, s.subject_name, s.subject_code
    FROM teacher_assignments ta
    JOIN classes c ON ta.class_id = c.id
    JOIN subjects s ON ta.subject_id = s.id
    WHERE ta.teacher_id = $1
    ORDER BY c.class_name, s.subject_name
  `, [teacherId]);
  return result.rows;
};

export const getAllAssignments = async () => {
  const result = await pool.query(`
    SELECT ta.*, u.full_name as teacher_name, c.class_name, s.subject_name
    FROM teacher_assignments ta
    JOIN users u ON ta.teacher_id = u.id
    JOIN classes c ON ta.class_id = c.id
    JOIN subjects s ON ta.subject_id = s.id
    ORDER BY u.full_name, c.class_name, s.subject_name
  `);
  return result.rows;
};

export const createAssignment = async (teacherId, classId, subjectId) => {
  try {
    const result = await pool.query(
      'INSERT INTO teacher_assignments (teacher_id, class_id, subject_id) VALUES ($1, $2, $3) RETURNING *',
      [teacherId, classId, subjectId]
    );
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError('This assignment already exists', 400);
    }
    throw error;
  }
};

export const deleteAssignment = async (assignmentId) => {
  const result = await pool.query(
    'DELETE FROM teacher_assignments WHERE id = $1 RETURNING *',
    [assignmentId]
  );
  if (result.rows.length === 0) {
    throw new AppError('Assignment not found', 404);
  }
  return result.rows[0];
};

// Student attendance statistics
export const getStudentAttendanceStats = async (filters = {}) => {
  let query = `
    SELECT 
      s.id as student_id,
      s.student_name,
      s.student_id as student_number,
      c.class_name,
      COUNT(ar.id) as total_records,
      COUNT(CASE WHEN ar.status = 'present' THEN 1 END) as present_count,
      COUNT(CASE WHEN ar.status = 'absent' THEN 1 END) as absent_count,
      COUNT(CASE WHEN ar.status = 'excused' THEN 1 END) as excused_count
    FROM students s
    JOIN classes c ON s.class_id = c.id
    LEFT JOIN attendance_records ar ON s.id = ar.student_id
    LEFT JOIN attendance_sessions ats ON ar.session_id = ats.id
    WHERE 1=1
  `;

  const params = [];
  let paramCount = 1;

  if (filters.classId) {
    query += ` AND s.class_id = $${paramCount}`;
    params.push(filters.classId);
    paramCount++;
  }

  if (filters.subjectId) {
    query += ` AND ats.subject_id = $${paramCount}`;
    params.push(filters.subjectId);
    paramCount++;
  }

  if (filters.startDate) {
    query += ` AND ats.session_date >= $${paramCount}`;
    params.push(filters.startDate);
    paramCount++;
  }

  if (filters.endDate) {
    query += ` AND ats.session_date <= $${paramCount}`;
    params.push(filters.endDate);
    paramCount++;
  }

  query += `
    GROUP BY s.id, s.student_name, s.student_id, c.class_name
    ORDER BY c.class_name, s.student_name
  `;

  const result = await pool.query(query, params);
  return result.rows;
};

// Attendance viewing
export const getAttendanceRecords = async (filters = {}) => {
  let query = `
    SELECT 
      ats.id as session_id,
      ats.session_date,
      ats.lecture_start_time,
      ats.lecture_end_time,
      u.full_name as teacher_name,
      c.class_name,
      s.subject_name,
      ats.submitted_at,
      json_agg(
        json_build_object(
          'student_id', st.id,
          'student_name', st.student_name,
          'student_number', st.student_id,
          'status', ar.status
        )
      ) as records
    FROM attendance_sessions ats
    JOIN users u ON ats.teacher_id = u.id
    JOIN classes c ON ats.class_id = c.id
    JOIN subjects s ON ats.subject_id = s.id
    LEFT JOIN attendance_records ar ON ats.id = ar.session_id
    LEFT JOIN students st ON ar.student_id = st.id
    WHERE 1=1
  `;

  const params = [];
  let paramCount = 1;

  if (filters.classId) {
    query += ` AND ats.class_id = $${paramCount}`;
    params.push(filters.classId);
    paramCount++;
  }

  if (filters.subjectId) {
    query += ` AND ats.subject_id = $${paramCount}`;
    params.push(filters.subjectId);
    paramCount++;
  }

  if (filters.date) {
    query += ` AND ats.session_date = $${paramCount}`;
    params.push(filters.date);
    paramCount++;
  }

  query += `
    GROUP BY ats.id, ats.session_date, u.full_name, c.class_name, s.subject_name, ats.submitted_at
    ORDER BY ats.session_date DESC, ats.submitted_at DESC
    LIMIT 100
  `;

  const result = await pool.query(query, params);
  return result.rows;
};

