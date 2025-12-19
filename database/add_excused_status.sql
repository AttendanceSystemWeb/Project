-- Add 'excused' status option to attendance_records
-- Run this to update your existing database

ALTER TABLE attendance_records 
DROP CONSTRAINT IF EXISTS attendance_records_status_check;

ALTER TABLE attendance_records 
ADD CONSTRAINT attendance_records_status_check 
CHECK (status IN ('present', 'absent', 'excused'));

-- Verify the change
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'attendance_records'::regclass 
AND contype = 'c';

