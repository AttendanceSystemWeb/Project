import pool from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

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

export const getStudentsForAttendance = async (teacherId, classId, subjectId) => {
  // First verify teacher has assignment
  const assignmentCheck = await pool.query(
    'SELECT id FROM teacher_assignments WHERE teacher_id = $1 AND class_id = $2 AND subject_id = $3',
    [teacherId, classId, subjectId]
  );

  if (assignmentCheck.rows.length === 0) {
    throw new AppError('You are not assigned to this class-subject combination', 403);
  }

  // Get students in the class
  const result = await pool.query(
    'SELECT id, student_name, student_id FROM students WHERE class_id = $1 ORDER BY student_name',
    [classId]
  );

  return result.rows;
};

export const submitAttendance = async (teacherId, classId, subjectId, date, attendanceData, lectureStartTime, lectureEndTime) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Verify teacher assignment
    const assignmentCheck = await client.query(
      'SELECT id FROM teacher_assignments WHERE teacher_id = $1 AND class_id = $2 AND subject_id = $3',
      [teacherId, classId, subjectId]
    );

    if (assignmentCheck.rows.length === 0) {
      throw new AppError('You are not assigned to this class-subject combination', 403);
    }

    // Check for duplicate session
    const duplicateCheck = await client.query(
      'SELECT id FROM attendance_sessions WHERE teacher_id = $1 AND class_id = $2 AND subject_id = $3 AND session_date = $4',
      [teacherId, classId, subjectId, date]
    );

    if (duplicateCheck.rows.length > 0) {
      throw new AppError('Attendance already submitted for this date', 400);
    }

    // Create session with lecture times
    const sessionResult = await client.query(
      'INSERT INTO attendance_sessions (teacher_id, class_id, subject_id, session_date, lecture_start_time, lecture_end_time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [teacherId, classId, subjectId, date, lectureStartTime, lectureEndTime]
    );

    const sessionId = sessionResult.rows[0].id;

    // Insert attendance records
    for (const record of attendanceData) {
      await client.query(
        'INSERT INTO attendance_records (session_id, student_id, status) VALUES ($1, $2, $3)',
        [sessionId, record.studentId, record.status]
      );
    }

    await client.query('COMMIT');

    return {
      sessionId,
      message: 'Attendance submitted successfully'
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getTeacherAttendanceHistory = async (teacherId, filters = {}) => {
  let query = `
    SELECT 
      ats.id as session_id,
      ats.session_date,
      ats.lecture_start_time,
      ats.lecture_end_time,
      c.class_name,
      s.subject_name,
      ats.submitted_at,
      COUNT(ar.id) as total_students,
      COUNT(CASE WHEN ar.status = 'absent' THEN 1 END) as absent_count,
      COUNT(CASE WHEN ar.status = 'present' THEN 1 END) as present_count,
      COUNT(CASE WHEN ar.status = 'excused' THEN 1 END) as excused_count
    FROM attendance_sessions ats
    JOIN classes c ON ats.class_id = c.id
    JOIN subjects s ON ats.subject_id = s.id
    LEFT JOIN attendance_records ar ON ats.id = ar.session_id
    WHERE ats.teacher_id = $1
  `;

  const params = [teacherId];
  let paramCount = 2;

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

  query += `
    GROUP BY ats.id, ats.session_date, c.class_name, s.subject_name, ats.submitted_at
    ORDER BY ats.session_date DESC, ats.submitted_at DESC
    LIMIT 50
  `;

  const result = await pool.query(query, params);
  return result.rows;
};

