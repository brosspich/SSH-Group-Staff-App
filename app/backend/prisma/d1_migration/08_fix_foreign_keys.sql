-- Migration 08: Fix Foreign Keys in DeviceSession, AttendanceLog, and AttendanceRequest to reference User(system_id)
PRAGMA foreign_keys = OFF;

-- 1. Recreate DeviceSession with reference to User(system_id)
CREATE TABLE IF NOT EXISTS DeviceSession_new (
    id TEXT PRIMARY KEY NOT NULL,
    userId TEXT NOT NULL,
    deviceName TEXT,
    modelName TEXT,
    os TEXT,
    osVersion TEXT,
    appVersion TEXT,
    ipAddress TEXT,
    location TEXT,
    isTerminated INTEGER NOT NULL DEFAULT 0,
    lastActive DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lastLogin DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User (system_id) ON DELETE CASCADE
);

INSERT OR REPLACE INTO DeviceSession_new (id, userId, deviceName, modelName, os, osVersion, appVersion, ipAddress, location, isTerminated, lastActive, lastLogin)
SELECT id, userId, deviceName, modelName, os, osVersion, appVersion, ipAddress, location, isTerminated, lastActive, lastLogin FROM DeviceSession;

DROP TABLE DeviceSession;
ALTER TABLE DeviceSession_new RENAME TO DeviceSession;

-- 2. Recreate AttendanceLog with reference to User(system_id)
CREATE TABLE IF NOT EXISTS AttendanceLog_new (
    id TEXT PRIMARY KEY NOT NULL,
    userId TEXT NOT NULL,
    companyId TEXT,
    scanDate TEXT NOT NULL,
    scanTime TEXT NOT NULL,
    type TEXT NOT NULL,
    qrData TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User (system_id) ON DELETE CASCADE,
    FOREIGN KEY (companyId) REFERENCES Company (id) ON DELETE SET NULL
);

INSERT OR REPLACE INTO AttendanceLog_new (id, userId, companyId, scanDate, scanTime, type, qrData, createdAt)
SELECT id, userId, companyId, scanDate, scanTime, type, qrData, createdAt FROM AttendanceLog;

DROP TABLE AttendanceLog;
ALTER TABLE AttendanceLog_new RENAME TO AttendanceLog;

-- 3. Recreate AttendanceRequest with reference to User(system_id)
CREATE TABLE IF NOT EXISTS AttendanceRequest_new (
    id TEXT PRIMARY KEY NOT NULL,
    userId TEXT NOT NULL,
    subject TEXT NOT NULL,
    remark TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    fromDate TEXT,
    fromTime TEXT,
    toDate TEXT,
    toTime TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User (system_id) ON DELETE CASCADE
);

INSERT OR REPLACE INTO AttendanceRequest_new (id, userId, subject, remark, status, fromDate, fromTime, toDate, toTime, createdAt)
SELECT id, userId, subject, remark, status, fromDate, fromTime, toDate, toTime, createdAt FROM AttendanceRequest;

DROP TABLE AttendanceRequest;
ALTER TABLE AttendanceRequest_new RENAME TO AttendanceRequest;

PRAGMA foreign_keys = ON;
