import fs from "fs";

const sqlPath =
  "C:/Users/itlan/.gemini/antigravity/brain/e31b88d8-d9da-4559-8dc0-11af3467fbc4/.user_uploaded/media_1793931505798_f063200f.sql";
const content = fs.readFileSync(sqlPath, "utf8");

const valuesIndex = content.indexOf("VALUES");
if (valuesIndex === -1) {
  console.error("VALUES not found");
  process.exit(1);
}

let valuesStr = content.slice(valuesIndex + 6).trim();
if (valuesStr.endsWith(";")) valuesStr = valuesStr.slice(0, -1);

function parseSqlRows(str) {
  const rows = [];
  let inString = false,
    currentVal = "",
    currentRow = [],
    depth = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i],
      nextChar = str[i + 1];
    if (inString) {
      if (char === "'" && nextChar === "'") {
        currentVal += "'";
        i++;
      } else if (char === "'") {
        inString = false;
      } else {
        currentVal += char;
      }
    } else {
      if (char === "'") {
        inString = true;
      } else if (char === "(") {
        if (depth === 0) {
          currentRow = [];
          currentVal = "";
        } else {
          currentVal += char;
        }
        depth++;
      } else if (char === ")") {
        depth--;
        if (depth === 0) {
          const valTrim = currentVal.trim();
          currentRow.push(
            valTrim.toLowerCase() === "null"
              ? null
              : valTrim === ""
                ? null
                : currentVal,
          );
          rows.push(currentRow);
          currentVal = "";
        } else {
          currentVal += char;
        }
      } else if (char === "," && depth === 1) {
        const valTrim = currentVal.trim();
        currentRow.push(
          valTrim.toLowerCase() === "null"
            ? null
            : valTrim === ""
              ? null
              : currentVal,
        );
        currentVal = "";
      } else if (char === "," && depth === 0) {
        // comma between tuples
      } else if (!/\s/.test(char) || currentVal.length > 0) {
        currentVal += char;
      }
    }
  }
  return rows;
}

const rows = parseSqlRows(valuesStr);
console.log(`Parsed ${rows.length} rows.`);

function escapeSql(val) {
  if (val === null || val === undefined || val === "null" || val === "NULL")
    return "NULL";
  return `'${String(val).replace(/'/g, "''")}'`;
}

function getIsActive(val) {
  if (val === false || val === "false" || val === 0 || val === "0") return 0;
  return 1;
}

function mapRole(roleJson) {
  if (!roleJson) return "member";
  try {
    const arr = JSON.parse(roleJson);
    if (Array.isArray(arr)) {
      if (arr.includes("owner")) return "owner";
      if (arr.includes("admin")) return "admin";
      if (arr.includes("leave")) return "leave";
      return "member";
    }
  } catch (e) {}
  return "member";
}

function getCompanyId(systemId) {
  if (systemId.startsWith("system-0001")) return "system-0001";
  if (systemId.startsWith("system-0002")) return "system-0002";
  if (systemId.startsWith("system-0003")) return "system-0003";
  return "system-0001";
}

const sqlStatements = [
  "-- Migration 09: Sync all 17 users and related data from Supabase backup",
  "PRAGMA foreign_keys = OFF;",
  "",
  "-- 0. Clean up any obsolete temporary keys or ids",
  "DELETE FROM UserDetails WHERE system_id = 'system-0002-bpak-0001';",
  "DELETE FROM User WHERE system_id = 'system-0002-bpak-0001';",
  "",
  "-- 0. Fix GroupMember and SshKey foreign keys to reference User(system_id)",
  "CREATE TABLE IF NOT EXISTS GroupMember_new (",
  "    id TEXT NOT NULL PRIMARY KEY,",
  "    userId TEXT NOT NULL,",
  "    groupId TEXT NOT NULL,",
  "    permission TEXT NOT NULL DEFAULT 'read',",
  "    joinedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,",
  "    FOREIGN KEY (userId) REFERENCES User (system_id) ON DELETE CASCADE ON UPDATE CASCADE,",
  "    FOREIGN KEY (groupId) REFERENCES SshGroup (id) ON DELETE CASCADE ON UPDATE CASCADE,",
  "    UNIQUE (userId, groupId)",
  ");",
  "",
  "INSERT OR REPLACE INTO GroupMember_new (id, userId, groupId, permission, joinedAt)",
  "SELECT",
  "    id,",
  "    CASE",
  "        WHEN userId LIKE 'system-%' THEN userId",
  "        WHEN userId = 'bpak-0001' THEN 'system-0002-0001'",
  "        WHEN userId = '0001' THEN 'system-0003-0001'",
  "        ELSE 'system-0001-' || userId",
  "    END AS userId,",
  "    groupId,",
  "    permission,",
  "    joinedAt",
  "FROM GroupMember;",
  "",
  "DROP TABLE IF EXISTS GroupMember;",
  "ALTER TABLE GroupMember_new RENAME TO GroupMember;",
  "",
  "CREATE TABLE IF NOT EXISTS SshKey_new (",
  "    id TEXT NOT NULL PRIMARY KEY,",
  "    userId TEXT NOT NULL,",
  "    name TEXT NOT NULL,",
  "    publicKey TEXT NOT NULL,",
  "    fingerprint TEXT NOT NULL,",
  "    keyType TEXT NOT NULL DEFAULT 'ED25519',",
  "    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,",
  "    lastUsedAt DATETIME,",
  "    expiresAt DATETIME,",
  "    FOREIGN KEY (userId) REFERENCES User (system_id) ON DELETE CASCADE ON UPDATE CASCADE",
  ");",
  "",
  "INSERT OR REPLACE INTO SshKey_new (id, userId, name, publicKey, fingerprint, keyType, createdAt, lastUsedAt, expiresAt)",
  "SELECT",
  "    id,",
  "    CASE",
  "        WHEN userId LIKE 'system-%' THEN userId",
  "        WHEN userId = 'bpak-0001' THEN 'system-0002-0001'",
  "        WHEN userId = '0001' THEN 'system-0003-0001'",
  "        ELSE 'system-0001-' || userId",
  "    END AS userId,",
  "    name,",
  "    publicKey,",
  "    fingerprint,",
  "    keyType,",
  "    createdAt,",
  "    lastUsedAt,",
  "    expiresAt",
  "FROM SshKey;",
  "",
  "DROP TABLE IF EXISTS SshKey;",
  "ALTER TABLE SshKey_new RENAME TO SshKey;",
  "",
];

// Ensure Companies exist
sqlStatements.push("-- Ensure Companies exist");
sqlStatements.push(
  `INSERT OR IGNORE INTO Company (id, name, qrCodes, location, telegramBotToken, telegramChatId, timeIn, timeOut, createdAt, updatedAt) VALUES ('system-0001', 'SSH Group', '["SSH_GROUP_ATTENDANCE_OFFICIAL_QR_2026","SSH-GROUP-STAFF-ATTENDANCE","SSH_GROUP_ATTENDANCE","ssh-group-attendance-01"]', '["11.502767, 104.851539"]', '["8911068365:AAEyHW4A2kWmTCAZgal606ArSsuVwArGEvE"]', '["-5567020132"]', '08:00:00', '17:00:00', datetime('now'), datetime('now'));`,
);
sqlStatements.push(
  `INSERT OR IGNORE INTO Company (id, name, qrCodes, location, telegramBotToken, telegramChatId, timeIn, timeOut, createdAt, updatedAt) VALUES ('system-0002', 'Bpak Developer', '["bpak_qr_attendance_01"]', '["11.536203, 104.858147", "11.502767, 104.851539"]', '["8976753860:AAG9u37q8E7_FI21R3imZkqL6oHOPfhngj4"]', '["-1004495388034"]', '08:00:00', '17:00:00', datetime('now'), datetime('now'));`,
);
sqlStatements.push(
  `UPDATE Company SET location = '["11.536203, 104.858147", "11.502767, 104.851539"]' WHERE id = 'system-0002';`,
);
sqlStatements.push(
  `INSERT OR IGNORE INTO Company (id, name, qrCodes, location, telegramBotToken, telegramChatId, timeIn, timeOut, createdAt, updatedAt) VALUES ('system-0003', 'Test Company', '["test_qr_code_01"]', '["11.556372, 104.928210"]', '["8976753860:AAG9u37q8E7_FI21R3imZkqL6oHOPfhngj4"]', '["-1004495388034"]', '08:00:00', '17:00:00', datetime('now'), datetime('now'));`,
);
sqlStatements.push("");

// 1. Users
sqlStatements.push("-- 1. Insert or Replace User table (17 users)");
for (const r of rows) {
  const [
    id,
    name,
    username,
    password,
    email,
    phone,
    position,
    role,
    devices,
    joined,
    attendance,
    rules,
    systemId,
    isActive,
  ] = r;
  const normalizedRole = mapRole(role);
  const activeInt = getIsActive(isActive);

  sqlStatements.push(
    `INSERT OR REPLACE INTO User (system_id, id, username, passwordHash, role, isActive, createdAt, updatedAt) VALUES (${escapeSql(systemId)}, ${escapeSql(id)}, ${escapeSql(username)}, ${escapeSql(password)}, ${escapeSql(normalizedRole)}, ${activeInt}, datetime('now'), datetime('now'));`,
  );
}
sqlStatements.push("");

// 2. UserDetails
sqlStatements.push("-- 2. Insert or Replace UserDetails table (17 users)");
for (const r of rows) {
  const [
    id,
    name,
    username,
    password,
    email,
    phone,
    position,
    role,
    devices,
    joined,
    attendance,
    rules,
    systemId,
    isActive,
  ] = r;
  const companyId = getCompanyId(systemId);

  sqlStatements.push(
    `INSERT OR REPLACE INTO UserDetails (system_id, company_id, name, email, phone, position, dob, joined, createdAt, updatedAt) VALUES (${escapeSql(systemId)}, ${escapeSql(companyId)}, ${escapeSql(name)}, ${escapeSql(email)}, ${escapeSql(phone)}, ${escapeSql(position)}, NULL, ${escapeSql(joined)}, datetime('now'), datetime('now'));`,
  );
}
sqlStatements.push("");

// 3. DeviceSession
sqlStatements.push("-- 3. Insert or Replace DeviceSession table");
let deviceCount = 0;
for (const r of rows) {
  const [
    id,
    name,
    username,
    password,
    email,
    phone,
    position,
    role,
    devices,
    joined,
    attendance,
    rules,
    systemId,
    isActive,
  ] = r;
  if (!devices) continue;
  try {
    const list = JSON.parse(devices);
    if (Array.isArray(list)) {
      for (const dev of list) {
        if (!dev.id) continue;
        const isTerminated =
          dev.terminate === "true" || dev.terminate === true ? 1 : 0;
        const lastActive =
          dev.last_active || dev.last_use_time || new Date().toISOString();
        const lastLogin = dev.last_login || new Date().toISOString();

        sqlStatements.push(
          `INSERT OR REPLACE INTO DeviceSession (id, userId, deviceName, modelName, os, osVersion, appVersion, ipAddress, location, isTerminated, lastActive, lastLogin) VALUES (${escapeSql(dev.id)}, ${escapeSql(systemId)}, ${escapeSql(dev.device_name)}, ${escapeSql(dev.model_name)}, ${escapeSql(dev.os)}, ${escapeSql(dev.os_version)}, ${escapeSql(dev.app_version)}, ${escapeSql(dev.ip_address)}, ${escapeSql(dev.location)}, ${isTerminated}, ${escapeSql(lastActive)}, ${escapeSql(lastLogin)});`,
        );
        deviceCount++;
      }
    }
  } catch (e) {
    console.error(`Error parsing devices for ${systemId}:`, e.message);
  }
}
console.log(`Generated ${deviceCount} device sessions.`);
sqlStatements.push("");

// 4. AttendanceLog
sqlStatements.push("-- 4. Insert or Replace AttendanceLog table");
let attCount = 0;
for (const r of rows) {
  const [
    id,
    name,
    username,
    password,
    email,
    phone,
    position,
    role,
    devices,
    joined,
    attendance,
    rules,
    systemId,
    isActive,
  ] = r;
  if (!attendance) continue;
  const companyId = getCompanyId(systemId);
  try {
    const list = JSON.parse(attendance);
    if (Array.isArray(list)) {
      for (const att of list) {
        if (!att.id) continue;
        const scanDate = att.date || "";
        const scanTime = att.time || "";
        const type = att.type
          ? att.type.toUpperCase().replace("-", "_")
          : "TIME_OTHER";
        const qrData = att.qr_data || null;
        const createdAt = att.timestamp || new Date().toISOString();

        sqlStatements.push(
          `INSERT OR REPLACE INTO AttendanceLog (id, userId, companyId, scanDate, scanTime, type, qrData, createdAt) VALUES (${escapeSql(att.id)}, ${escapeSql(systemId)}, ${escapeSql(companyId)}, ${escapeSql(scanDate)}, ${escapeSql(scanTime)}, ${escapeSql(type)}, ${escapeSql(qrData)}, ${escapeSql(createdAt)});`,
        );
        attCount++;
      }
    }
  } catch (e) {
    console.error(`Error parsing attendance for ${systemId}:`, e.message);
  }
}
console.log(`Generated ${attCount} attendance logs.`);
sqlStatements.push("");

// 5. AttendanceRequest
sqlStatements.push("-- 5. Insert or Replace AttendanceRequest table");
let ruleCount = 0;
for (const r of rows) {
  const [
    id,
    name,
    username,
    password,
    email,
    phone,
    position,
    role,
    devices,
    joined,
    attendance,
    rules,
    systemId,
    isActive,
  ] = r;
  if (!rules) continue;
  try {
    const list = JSON.parse(rules);
    if (Array.isArray(list)) {
      for (const rule of list) {
        if (!rule.id) continue;
        const subject = rule.subject || "Request";
        const remark = rule.remark || null;
        const status = rule.status || "pending";
        const fromDate = rule.from_date || null;
        const fromTime = rule.from_time || null;
        const toDate = rule.to_date || null;
        const toTime = rule.to_time || null;
        const createdAt = rule.created_at || new Date().toISOString();

        sqlStatements.push(
          `INSERT OR REPLACE INTO AttendanceRequest (id, userId, subject, remark, status, fromDate, fromTime, toDate, toTime, createdAt) VALUES (${escapeSql(rule.id)}, ${escapeSql(systemId)}, ${escapeSql(subject)}, ${escapeSql(remark)}, ${escapeSql(status)}, ${escapeSql(fromDate)}, ${escapeSql(fromTime)}, ${escapeSql(toDate)}, ${escapeSql(toTime)}, ${escapeSql(createdAt)});`,
        );
        ruleCount++;
      }
    }
  } catch (e) {
    console.error(`Error parsing rules for ${systemId}:`, e.message);
  }
}
console.log(`Generated ${ruleCount} attendance requests.`);
sqlStatements.push("");
sqlStatements.push("PRAGMA foreign_keys = ON;");

const outPath =
  "app/backend/prisma/d1_migration/09_sync_all_users_from_supabase.sql";
fs.writeFileSync(outPath, sqlStatements.join("\n"), "utf8");
console.log(
  `Successfully generated migration file: ${outPath} (${sqlStatements.length} lines)`,
);
