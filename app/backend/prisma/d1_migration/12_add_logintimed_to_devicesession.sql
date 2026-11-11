-- Migration 12: Add loginTimed column to DeviceSession
ALTER TABLE DeviceSession ADD COLUMN loginTimed DATETIME;
UPDATE DeviceSession SET loginTimed = lastLogin WHERE loginTimed IS NULL;
