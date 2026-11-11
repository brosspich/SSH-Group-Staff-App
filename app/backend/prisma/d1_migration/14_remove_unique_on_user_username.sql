-- Migration 14: Remove global UNIQUE constraint on User.username so usernames are unique per system
PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS User_new (
    system_id TEXT PRIMARY KEY NOT NULL,
    id TEXT NOT NULL,
    username TEXT NOT NULL,
    passwordHash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    isActive INTEGER NOT NULL DEFAULT 1,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO User_new (system_id, id, username, passwordHash, role, isActive, createdAt, updatedAt)
SELECT system_id, id, username, passwordHash, role, isActive, createdAt, updatedAt FROM User;

DROP TABLE User;
ALTER TABLE User_new RENAME TO User;

CREATE INDEX IF NOT EXISTS idx_user_id ON User (id);
CREATE INDEX IF NOT EXISTS idx_user_username ON User (username);

PRAGMA foreign_keys = ON;
