-- Add image and remark columns to AttendanceLog table
ALTER TABLE AttendanceLog ADD COLUMN image TEXT;
ALTER TABLE AttendanceLog ADD COLUMN remark TEXT;
