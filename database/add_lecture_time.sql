-- Add lecture time fields to attendance_sessions table

ALTER TABLE attendance_sessions 
ADD COLUMN lecture_start_time TIME,
ADD COLUMN lecture_end_time TIME;

-- Verify the change
\d attendance_sessions

