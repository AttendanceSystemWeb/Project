# Database Update Instructions

## Updates Required

### 1. Add Lecture Time Fields

Run this command in PowerShell:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d sams_db -c "ALTER TABLE attendance_sessions ADD COLUMN IF NOT EXISTS lecture_start_time TIME, ADD COLUMN IF NOT EXISTS lecture_end_time TIME;"
```

### 2. Add Excused Status Support

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d sams_db -c "ALTER TABLE attendance_records DROP CONSTRAINT IF EXISTS attendance_records_status_check; ALTER TABLE attendance_records ADD CONSTRAINT attendance_records_status_check CHECK (status IN ('present', 'absent', 'excused'));"
```

## Verify Changes

Check if the updates were successful:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d sams_db -c "\d attendance_sessions"
```

You should see `lecture_start_time` and `lecture_end_time` columns.

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d sams_db -c "\d attendance_records"
```

You should see the updated check constraint allowing 'present', 'absent', 'excused'.

## Done!

After running these commands, restart your backend server and refresh your frontend to use the new features.

