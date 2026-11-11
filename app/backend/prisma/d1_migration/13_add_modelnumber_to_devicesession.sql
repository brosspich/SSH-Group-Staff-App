-- Migration 13: Add modelNumber to DeviceSession and update existing P50 Pro rows
ALTER TABLE DeviceSession ADD COLUMN modelNumber TEXT;
UPDATE DeviceSession SET modelNumber = 'JAD-AL00', osVersion = '4.2.0' WHERE modelName LIKE '%P50 Pro%' OR deviceName LIKE '%P50 Pro%';
