const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const sqlInputPath =
  "C:/Users/itlan/.gemini/antigravity/brain/e31b88d8-d9da-4559-8dc0-11af3467fbc4/.user_uploaded/media_1793775328780_d0e03bc6.sql";
const outputSqlPath = path.join(
  __dirname,
  "../prisma/cloudflare_d1_import_supabase.sql",
);

const content = fs.readFileSync(sqlInputPath, "utf8");
const valuesIdx = content.indexOf("VALUES");
if (valuesIdx === -1) {
  console.error("No VALUES found in SQL file");
  process.exit(1);
}

const afterValues = content.slice(valuesIdx + 6).trim();

function parseSqlValues(str) {
  const rows = [];
  let inTuple = false,
    inString = false,
    currentVal = "",
    currentRow = [],
    i = 0;
  while (i < str.length) {
    const ch = str[i],
      next = str[i + 1];
    if (!inTuple) {
      if (ch === "(") {
        inTuple = true;
        currentRow = [];
        currentVal = "";
      }
      i++;
      continue;
    }
    if (inString) {
      if (ch === "'" && next === "'") {
        currentVal += "'";
        i += 2;
        continue;
      } else if (ch === "'") {
        inString = false;
        i++;
        continue;
      } else {
        currentVal += ch;
        i++;
        continue;
      }
    }
    if (ch === "'") {
      inString = true;
      i++;
      continue;
    }
    if (ch === ",") {
      const trimmed = currentVal.trim();
      currentRow.push(
        trimmed === "null"
          ? null
          : trimmed === "true"
            ? true
            : trimmed === "false"
              ? false
              : currentVal,
      );
      currentVal = "";
      i++;
      continue;
    }
    if (ch === ")") {
      const trimmed = currentVal.trim();
      currentRow.push(
        trimmed === "null"
          ? null
          : trimmed === "true"
            ? true
            : trimmed === "false"
              ? false
              : currentVal,
      );
      currentVal = "";
      rows.push(currentRow);
      inTuple = false;
      i++;
      continue;
    }
    currentVal += ch;
    i++;
  }
  return rows;
}

const rows = parseSqlValues(afterValues);
console.log(`Parsed ${rows.length} staff rows from Supabase SQL export.`);

function sqlEscape(val) {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") return String(val);
  if (typeof val === "boolean") return val ? "1" : "0";
  return `'${String(val).replace(/'/g, "''")}'`;
}

// 1. Companies
const companies = [
  {
    id: "system-0001",
    name: "SSH Group",
    qrCodes:
      '["SSH_GROUP_ATTENDANCE_OFFICIAL_QR_2026","SSH-GROUP-STAFF-ATTENDANCE","SSH_GROUP_ATTENDANCE","ssh-group-attendance-01"]',
    location: '["11.502767, 104.851539"]',
    telegramBotToken: '["8911068365:AAEyHW4A2kWmTCAZgal606ArSsuVwArGEvE"]',
    telegramChatId: '["-5567020132"]',
    timeIn: "08:00:00",
    timeOut: "17:00:00",
  },
  {
    id: "system-0002",
    name: "Bpak Developer",
    qrCodes: '["bpak_qr_attendance_01"]',
    location: '["11.536203, 104.858147"]',
    telegramBotToken: '["8976753860:AAG9u37q8E7_FI21R3imZkqL6oHOPfhngj4"]',
    telegramChatId: '["-1004495388034"]',
    timeIn: "08:00:00",
    timeOut: "17:00:00",
  },
  {
    id: "system-0003",
    name: "Test Company",
    qrCodes: '["test_qr_code_01"]',
    location: '["11.556372, 104.928210"]',
    telegramBotToken: '["8976753860:AAG9u37q8E7_FI21R3imZkqL6oHOPfhngj4"]',
    telegramChatId: '["-1004495388034"]',
    timeIn: "08:00:00",
    timeOut: "17:00:00",
  },
];

let sqlOutput = `-- ========================================================\n`;
sqlOutput += `-- Cloudflare D1 Full Database Population from Supabase Data\n`;
sqlOutput += `-- Generated at: ${new Date().toISOString()}\n`;
sqlOutput += `-- ========================================================\n\n`;

// 1. Companies
sqlOutput += `-- 1. Insert Companies\n`;
for (const c of companies) {
  sqlOutput += `INSERT OR REPLACE INTO Company (id, name, qrCodes, location, telegramBotToken, telegramChatId, timeIn, timeOut, createdAt, updatedAt) VALUES (${sqlEscape(c.id)}, ${sqlEscape(c.name)}, ${sqlEscape(c.qrCodes)}, ${sqlEscape(c.location)}, ${sqlEscape(c.telegramBotToken)}, ${sqlEscape(c.telegramChatId)}, ${sqlEscape(c.timeIn)}, ${sqlEscape(c.timeOut)}, datetime('now'), datetime('now'));\n`;
}
sqlOutput += `\n`;

// 2. Users
sqlOutput += `-- 2. Insert or Replace Users\n`;
const attendanceLogs = [];
const attendanceRequests = [];
const deviceSessions = [];

for (const r of rows) {
  const id = (r[0] || "").trim();
  const name = r[1] ? r[1].trim() : null;
  const username = r[2] ? r[2].trim() : null;
  const password = r[3] ? r[3].trim() : null;
  const email = r[4] ? r[4].trim() : null;
  const phone = r[5] ? r[5].trim() : null;
  const position = r[6] ? r[6].trim() : null;
  const rawRole = r[7];
  const devicesRaw = r[8];
  const joined = r[9] ? r[9].trim() : null;
  const attendanceRaw = r[10];
  const requestRulesRaw = r[11];
  const systemId = r[12] ? r[12].trim() : null;
  const isActive = r[13] !== false ? 1 : 0;

  // Determine normalized role
  let role = "member";
  if (
    id === "0022" ||
    id === "bpak-0001" ||
    username === "brosspich" ||
    username === "bpak"
  ) {
    role = "admin";
  } else if (username === "pichboyloy") {
    role = "owner";
  }

  // Determine companyId from systemId (e.g. "system-0001-0022" -> "system-0001")
  let companyId = "system-0001";
  if (systemId && systemId.startsWith("system-0002")) {
    companyId = "system-0002";
  } else if (systemId && systemId.startsWith("system-0003")) {
    companyId = "system-0003";
  }

  sqlOutput += `INSERT OR REPLACE INTO User (id, username, email, passwordHash, name, phone, position, role, isActive, company_id, createdAt, updatedAt) VALUES (${sqlEscape(id)}, ${sqlEscape(username)}, ${sqlEscape(email)}, ${sqlEscape(password)}, ${sqlEscape(name)}, ${sqlEscape(phone)}, ${sqlEscape(position)}, ${sqlEscape(role)}, ${isActive}, ${sqlEscape(companyId)}, datetime('now'), datetime('now'));\n`;

  // Parse attendance logs
  if (attendanceRaw && attendanceRaw !== "[]") {
    try {
      const logs = JSON.parse(attendanceRaw);
      for (const log of logs) {
        // Unique ID per scan
        const logId = log.id
          ? `${id}_${log.id}`
          : `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const scanDate =
          log.date || (log.timestamp ? log.timestamp.split("T")[0] : "");
        const scanTime = log.time || "";
        const type = log.type || "time-in";
        const qrData = log.qr_data || null;
        const createdAt = log.timestamp || new Date().toISOString();

        attendanceLogs.push({
          id: logId,
          userId: id,
          companyId: companyId,
          scanDate: scanDate,
          scanTime: scanTime,
          type: type,
          qrData: qrData,
          createdAt: createdAt,
        });
      }
    } catch (e) {
      console.error(`Error parsing attendance for user ${id}:`, e.message);
    }
  }

  // Parse attendance requests
  if (requestRulesRaw && requestRulesRaw !== "[]") {
    try {
      const reqs = JSON.parse(requestRulesRaw);
      for (const req of reqs) {
        const reqId = req.id
          ? `${id}_${req.id}`
          : `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const subject = req.subject || "Attendance Request";
        const remark = req.remark || null;
        const status = req.status || "pending";
        const fromDate = req.from_date || req.fromDate || null;
        const fromTime = req.from_time || req.fromTime || null;
        const toDate = req.to_date || req.toDate || null;
        const toTime = req.to_time || req.toTime || null;
        const createdAt =
          req.created_at || req.createdAt || new Date().toISOString();

        attendanceRequests.push({
          id: reqId,
          userId: id,
          subject: subject,
          remark: remark,
          status: status,
          fromDate: fromDate,
          fromTime: fromTime,
          toDate: toDate,
          toTime: toTime,
          createdAt: createdAt,
        });
      }
    } catch (e) {
      console.error(`Error parsing requests for user ${id}:`, e.message);
    }
  }

  // Parse device sessions
  if (devicesRaw && devicesRaw !== "[]") {
    try {
      const devs = JSON.parse(devicesRaw);
      for (const dev of devs) {
        const devId =
          dev.id ||
          `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const deviceName = dev.device_name || null;
        const modelName = dev.model_name || null;
        const os = dev.os || null;
        const osVersion = dev.os_version || null;
        const appVersion = dev.app_version || null;
        const ipAddress = dev.ip_address || null;
        const location = dev.location || null;
        const isTerminated =
          dev.terminate === "true" || dev.terminate === true ? 1 : 0;
        const lastActive = dev.last_active || new Date().toISOString();
        const lastLogin = dev.last_login || new Date().toISOString();

        deviceSessions.push({
          id: devId,
          userId: id,
          deviceName: deviceName,
          modelName: modelName,
          os: os,
          osVersion: osVersion,
          appVersion: appVersion,
          ipAddress: ipAddress,
          location: location,
          isTerminated: isTerminated,
          lastActive: lastActive,
          lastLogin: lastLogin,
        });
      }
    } catch (e) {
      console.error(`Error parsing devices for user ${id}:`, e.message);
    }
  }
}
sqlOutput += `\n`;

// 3. Attendance Logs
sqlOutput += `-- 3. Insert Attendance Logs (${attendanceLogs.length} records)\n`;
for (const l of attendanceLogs) {
  sqlOutput += `INSERT OR REPLACE INTO AttendanceLog (id, userId, companyId, scanDate, scanTime, type, qrData, createdAt) VALUES (${sqlEscape(l.id)}, ${sqlEscape(l.userId)}, ${sqlEscape(l.companyId)}, ${sqlEscape(l.scanDate)}, ${sqlEscape(l.scanTime)}, ${sqlEscape(l.type)}, ${sqlEscape(l.qrData)}, ${sqlEscape(l.createdAt)});\n`;
}
sqlOutput += `\n`;

// 4. Attendance Requests
sqlOutput += `-- 4. Insert Attendance Requests (${attendanceRequests.length} records)\n`;
for (const q of attendanceRequests) {
  sqlOutput += `INSERT OR REPLACE INTO AttendanceRequest (id, userId, subject, remark, status, fromDate, fromTime, toDate, toTime, createdAt) VALUES (${sqlEscape(q.id)}, ${sqlEscape(q.userId)}, ${sqlEscape(q.subject)}, ${sqlEscape(q.remark)}, ${sqlEscape(q.status)}, ${sqlEscape(q.fromDate)}, ${sqlEscape(q.fromTime)}, ${sqlEscape(q.toDate)}, ${sqlEscape(q.toTime)}, ${sqlEscape(q.createdAt)});\n`;
}
sqlOutput += `\n`;

// 5. Device Sessions
sqlOutput += `-- 5. Insert Device Sessions (${deviceSessions.length} records)\n`;
for (const d of deviceSessions) {
  sqlOutput += `INSERT OR REPLACE INTO DeviceSession (id, userId, deviceName, modelName, os, osVersion, appVersion, ipAddress, location, isTerminated, lastActive, lastLogin) VALUES (${sqlEscape(d.id)}, ${sqlEscape(d.userId)}, ${sqlEscape(d.deviceName)}, ${sqlEscape(d.modelName)}, ${sqlEscape(d.os)}, ${sqlEscape(d.osVersion)}, ${sqlEscape(d.appVersion)}, ${sqlEscape(d.ipAddress)}, ${sqlEscape(d.location)}, ${d.isTerminated}, ${sqlEscape(d.lastActive)}, ${sqlEscape(d.lastLogin)});\n`;
}
sqlOutput += `\n`;

// 6. SSH Groups and Members
sqlOutput += `-- 6. SSH Groups and Members\n`;
sqlOutput += `INSERT OR REPLACE INTO SshGroup (id, name, description, serverCount, createdAt, updatedAt) VALUES
('grp-prod', 'Production Servers', 'Main production cluster and public APIs', 5, datetime('now'), datetime('now')),
('grp-staging', 'Staging Environment', 'Pre-release testing and QA servers', 2, datetime('now'), datetime('now')),
('grp-dev', 'Development Cluster', 'Internal developer sandboxes and staging VMs', 3, datetime('now'), datetime('now')),
('grp-database', 'Database Infrastructure', 'Cloudflare D1, SQLite & Cache instances', 2, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO GroupMember (id, userId, groupId, permission, joinedAt) VALUES
('mem-01', '0022', 'grp-prod', 'admin', datetime('now')),
('mem-02', '0022', 'grp-staging', 'admin', datetime('now')),
('mem-03', '0022', 'grp-dev', 'admin', datetime('now')),
('mem-04', '0022', 'grp-database', 'admin', datetime('now')),
('mem-05', 'bpak-0001', 'grp-prod', 'admin', datetime('now')),
('mem-06', 'bpak-0001', 'grp-staging', 'admin', datetime('now')),
('mem-07', 'bpak-0001', 'grp-dev', 'admin', datetime('now')),
('mem-08', 'bpak-0001', 'grp-database', 'admin', datetime('now')),
('mem-09', '0001', 'grp-dev', 'write', datetime('now')),
('mem-10', '0015', 'grp-staging', 'read', datetime('now')),
('mem-11', '0000', 'grp-dev', 'read', datetime('now'));
\n`;

// 7. Legacy Tables for full direct-table compatibility
sqlOutput += `-- 7. Legacy Tables Compatibility (ssh-group-staff-attendance-qr & ssh_group_staff_users)\n`;
sqlOutput += `CREATE TABLE IF NOT EXISTS "ssh-group-staff-attendance-qr" (
    id TEXT PRIMARY KEY,
    "qr-code" TEXT,
    company_name TEXT,
    location TEXT,
    telegram_bot_token TEXT,
    telegram_chat_id TEXT,
    "time-in" TEXT,
    "time-out" TEXT
);\n`;

for (const c of companies) {
  sqlOutput += `INSERT OR REPLACE INTO "ssh-group-staff-attendance-qr" (id, "qr-code", company_name, location, telegram_bot_token, telegram_chat_id, "time-in", "time-out") VALUES (${sqlEscape(c.id)}, ${sqlEscape(c.qrCodes)}, ${sqlEscape(c.name)}, ${sqlEscape(c.location)}, ${sqlEscape(c.telegramBotToken)}, ${sqlEscape(c.telegramChatId)}, ${sqlEscape(c.timeIn)}, ${sqlEscape(c.timeOut)});\n`;
}

sqlOutput += `\nCREATE TABLE IF NOT EXISTS ssh_group_staff_users (
    id TEXT PRIMARY KEY,
    name TEXT,
    username TEXT UNIQUE,
    password TEXT,
    email TEXT,
    phone TEXT,
    position TEXT,
    role TEXT,
    devices TEXT,
    joined TEXT,
    attendance TEXT,
    request_attendance_rules TEXT,
    system_id TEXT,
    is_active INTEGER DEFAULT 1
);\n\n`;

let rawSupabaseSql = content.replace(
  /public\.ssh_group_staff_users/g,
  "ssh_group_staff_users",
);
rawSupabaseSql = rawSupabaseSql.replace(
  /INSERT INTO ssh_group_staff_users/g,
  "INSERT OR REPLACE INTO ssh_group_staff_users",
);
sqlOutput += rawSupabaseSql + "\n";

// Write to file
fs.writeFileSync(outputSqlPath, sqlOutput, "utf8");
console.log(`Generated migration SQL at: ${outputSqlPath}`);
console.log(`Counts:
  - Companies: ${companies.length}
  - Users: ${rows.length}
  - Attendance Logs: ${attendanceLogs.length}
  - Attendance Requests: ${attendanceRequests.length}
  - Device Sessions: ${deviceSessions.length}
`);

// Now apply directly to local dev.db using PrismaClient!
async function applyToLocalDb() {
  console.log("Applying data to local dev.db...");
  const prisma = new PrismaClient();

  // 1. Companies
  for (const c of companies) {
    await prisma.company.upsert({
      where: { id: c.id },
      create: c,
      update: c,
    });
  }

  // 2. Users
  for (const r of rows) {
    const id = (r[0] || "").trim();
    const name = r[1] ? r[1].trim() : null;
    const username = r[2] ? r[2].trim() : null;
    const password = r[3] ? r[3].trim() : null;
    const email = r[4] ? r[4].trim() : null;
    const phone = r[5] ? r[5].trim() : null;
    const position = r[6] ? r[6].trim() : null;
    const systemId = r[12] ? r[12].trim() : null;
    const isActive = r[13] !== false;

    let role = "member";
    if (
      id === "0022" ||
      id === "bpak-0001" ||
      username === "brosspich" ||
      username === "bpak"
    ) {
      role = "admin";
    } else if (username === "pichboyloy") {
      role = "owner";
    }

    let companyId = "system-0001";
    if (systemId && systemId.startsWith("system-0002"))
      companyId = "system-0002";
    else if (systemId && systemId.startsWith("system-0003"))
      companyId = "system-0003";

    await prisma.user.upsert({
      where: { id },
      create: {
        id,
        username: username || id,
        email,
        passwordHash: password || "",
        name,
        phone,
        position,
        role,
        isActive,
        companyId,
      },
      update: {
        name,
        phone,
        position,
        role,
        isActive,
        companyId,
        email,
      },
    });

    // Also update staffUser table in dev.db
    await prisma.staffUser.upsert({
      where: { id },
      create: {
        id,
        name,
        username,
        password,
        email,
        phone,
        position,
        role: r[7] ? String(r[7]) : null,
        devices: r[8] ? String(r[8]) : null,
        joined: r[9] ? String(r[9]) : null,
        attendance: r[10] ? String(r[10]) : null,
        requestAttendanceRules: r[11] ? String(r[11]) : null,
        systemId,
        isActive,
      },
      update: {
        name,
        phone,
        position,
        role: r[7] ? String(r[7]) : null,
        devices: r[8] ? String(r[8]) : null,
        joined: r[9] ? String(r[9]) : null,
        attendance: r[10] ? String(r[10]) : null,
        requestAttendanceRules: r[11] ? String(r[11]) : null,
        systemId,
        isActive,
      },
    });
  }

  // 3. Attendance Logs
  // Clear and insert
  await prisma.attendanceLog.deleteMany({});
  for (const l of attendanceLogs) {
    await prisma.attendanceLog.create({
      data: {
        id: l.id,
        userId: l.userId,
        companyId: l.companyId,
        scanDate: l.scanDate,
        scanTime: l.scanTime,
        type: l.type,
        qrData: l.qrData,
        createdAt: new Date(l.createdAt),
      },
    });
  }

  // 4. Attendance Requests
  await prisma.attendanceRequest.deleteMany({});
  for (const q of attendanceRequests) {
    await prisma.attendanceRequest.create({
      data: {
        id: q.id,
        userId: q.userId,
        subject: q.subject,
        remark: q.remark,
        status: q.status,
        fromDate: q.fromDate,
        fromTime: q.fromTime,
        toDate: q.toDate,
        toTime: q.toTime,
        createdAt: new Date(q.createdAt),
      },
    });
  }

  // 5. Device Sessions
  for (const d of deviceSessions) {
    await prisma.deviceSession.upsert({
      where: { id: d.id },
      create: {
        id: d.id,
        userId: d.userId,
        deviceName: d.deviceName,
        modelName: d.modelName,
        os: d.os,
        osVersion: d.osVersion,
        appVersion: d.appVersion,
        ipAddress: d.ipAddress,
        location: d.location,
        isTerminated: d.isTerminated,
        lastActive: new Date(d.lastActive),
        lastLogin: new Date(d.lastLogin),
      },
      update: {
        deviceName: d.deviceName,
        modelName: d.modelName,
        os: d.os,
        osVersion: d.osVersion,
        appVersion: d.appVersion,
        ipAddress: d.ipAddress,
        location: d.location,
        isTerminated: d.isTerminated,
        lastActive: new Date(d.lastActive),
        lastLogin: new Date(d.lastLogin),
      },
    });
  }

  console.log("Successfully updated local dev.db with all Supabase data!");
  await prisma.$disconnect();
}

applyToLocalDb().catch((e) => {
  console.error("Failed applying to local db:", e);
});
