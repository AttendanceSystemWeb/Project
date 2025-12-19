-- Add 'excused' status to attendance_records table
-- This updates the CHECK constraint to allow 'excused' in addition to 'present' and 'absent'

ALTER TABLE attendance_records 
DROP CONSTRAINT IF EXISTS attendance_records_status_check;

ALTER TABLE attendance_records 
ADD CONSTRAINT attendance_records_status_check 
CHECK (status IN ('present', 'absent', 'excused'));

