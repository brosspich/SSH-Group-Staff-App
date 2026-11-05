-- Migration 07: Split User table into User and UserDetails, and add joined date
-- User: (system_id, id, username, passwordHash, role, isActive, createdAt, updatedAt)
-- UserDetails: (system_id, company_id, name, email, phone, position, dob, joined, createdAt, updatedAt)

PRAGMA foreign_keys = OFF;

-- 1. Create the new normalized User table
CREATE TABLE IF NOT EXISTS User_new (
    system_id TEXT PRIMARY KEY NOT NULL,
    id TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    isActive INTEGER NOT NULL DEFAULT 1,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create the UserDetails table
CREATE TABLE IF NOT EXISTS UserDetails (
    system_id TEXT PRIMARY KEY NOT NULL,
    company_id TEXT,
    name TEXT,
    email TEXT,
    phone TEXT,
    position TEXT,
    dob TEXT,
    joined TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (system_id) REFERENCES User (system_id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES Company (id) ON DELETE SET NULL
);

-- 3. Populate User_new from existing User table
INSERT OR REPLACE INTO User_new (system_id, id, username, passwordHash, role, isActive, createdAt, updatedAt)
SELECT 
    CASE 
        WHEN id LIKE 'system-%' THEN id
        WHEN company_id IS NOT NULL AND company_id != '' THEN company_id || '-' || id
        ELSE 'system-0001-' || id
    END AS system_id,
    id,
    username,
    passwordHash,
    role,
    isActive,
    createdAt,
    updatedAt
FROM User;

-- 4. Populate UserDetails from existing User table
INSERT OR REPLACE INTO UserDetails (system_id, company_id, name, email, phone, position, dob, joined, createdAt, updatedAt)
SELECT 
    CASE 
        WHEN id LIKE 'system-%' THEN id
        WHEN company_id IS NOT NULL AND company_id != '' THEN company_id || '-' || id
        ELSE 'system-0001-' || id
    END AS system_id,
    company_id,
    name,
    email,
    phone,
    position,
    NULL AS dob,
    CASE 
        WHEN id = '0022' THEN '2026-05-11'
        WHEN id = '0000' THEN '2026-08-08'
        ELSE NULL
    END AS joined,
    createdAt,
    updatedAt
FROM User;

-- 5. Update foreign keys in AttendanceLog so userId references system_id
UPDATE AttendanceLog 
SET userId = CASE 
    WHEN userId LIKE 'system-%' THEN userId
    WHEN companyId IS NOT NULL AND companyId != '' THEN companyId || '-' || userId
    ELSE 'system-0001-' || userId
END
WHERE userId NOT LIKE 'system-%';

-- 6. Update foreign keys in AttendanceRequest
UPDATE AttendanceRequest 
SET userId = (
    SELECT u.system_id 
    FROM User_new u 
    WHERE u.id = AttendanceRequest.userId 
    LIMIT 1
)
WHERE userId NOT LIKE 'system-%' AND EXISTS (
    SELECT 1 FROM User_new u WHERE u.id = AttendanceRequest.userId
);

-- 7. Update foreign keys in DeviceSession
UPDATE DeviceSession 
SET userId = (
    SELECT u.system_id 
    FROM User_new u 
    WHERE u.id = DeviceSession.userId 
    LIMIT 1
)
WHERE userId NOT LIKE 'system-%' AND EXISTS (
    SELECT 1 FROM User_new u WHERE u.id = DeviceSession.userId
);

-- 8. Drop old User table and rename User_new to User
DROP TABLE User;
ALTER TABLE User_new RENAME TO User;

-- 9. Create indexes for maximum query performance
CREATE INDEX IF NOT EXISTS idx_user_id ON User (id);
CREATE INDEX IF NOT EXISTS idx_user_username ON User (username);
CREATE INDEX IF NOT EXISTS idx_user_details_company_id ON UserDetails (company_id);

PRAGMA foreign_keys = ON;
