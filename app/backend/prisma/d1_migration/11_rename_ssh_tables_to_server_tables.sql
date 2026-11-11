-- Migration 11: Rename SshGroup and SshKey tables to ServerGroup and ServerKey
PRAGMA foreign_keys = OFF;

-- 1. Rename SshGroup to ServerGroup
ALTER TABLE SshGroup RENAME TO ServerGroup;

-- 2. Rename SshKey to ServerKey
ALTER TABLE SshKey RENAME TO ServerKey;

PRAGMA foreign_keys = ON;
