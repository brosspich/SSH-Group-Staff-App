const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const {
  CloudflareD1Client,
} = require("../dist/infrastructure/database/d1Client.js");
const { rawSql } = require("./raw_users_input.js");

const d1 = new CloudflareD1Client();

// 1. November 18 records from user's latest upload
const todayRecords = [
  {
    id: "system-0001-0007-ATT-0000-0021",
    userId: "system-0001-0007",
    companyId: "system-0001",
    scanDate: "2026-11-18",
    scanTime: "8:09:43 AM",
    type: "TIME_IN",
    qrData: "ssh-group-attendance-01",
    createdAt: "2026-11-18T01:09:43.756Z",
  },
  {
    id: "system-0001-0015-ATT-0000-0016",
    userId: "system-0001-0015",
    companyId: "system-0001",
    scanDate: "2026-11-18",
    scanTime: "8:13:14 AM",
    type: "TIME_IN",
    qrData: "ssh-group-attendance-01",
    createdAt: "2026-11-18T01:13:14.595Z",
  },
  {
    id: "system-0001-0016-ATT-0000-0037",
    userId: "system-0001-0016",
    companyId: "system-0001",
    scanDate: "2026-11-18",
    scanTime: "8:09:29 AM",
    type: "TIME_IN",
    qrData: "ssh-group-attendance-01",
    createdAt: "2026-11-18T01:09:29.334Z",
  },
  {
    id: "system-0001-0017-ATT-0000-0028",
    userId: "system-0001-0017",
    companyId: "system-0001",
    scanDate: "2026-11-18",
    scanTime: "8:07:33 AM",
    type: "TIME_IN",
    qrData: "ssh-group-attendance-01",
    createdAt: "2026-11-18T01:07:33.379Z",
  },
  {
    id: "system-0001-0019-ATT-0000-0012",
    userId: "system-0001-0019",
    companyId: "system-0001",
    scanDate: "2026-11-18",
    scanTime: "8:12:53 AM",
    type: "TIME_IN",
    qrData: "ssh-group-attendance-01",
    createdAt: "2026-11-18T01:12:53.362Z",
  },
  {
    id: "system-0001-0020-ATT-0000-0021",
    userId: "system-0001-0020",
    companyId: "system-0001",
    scanDate: "2026-11-18",
    scanTime: "8:12:53 AM",
    type: "TIME_IN",
    qrData: "ssh-group-attendance-01",
    createdAt: "2026-11-18T01:12:53.845Z",
  },
  {
    id: "system-0001-0021-ATT-0000-0016",
    userId: "system-0001-0021",
    companyId: "system-0001",
    scanDate: "2026-11-18",
    scanTime: "8:08:47 AM",
    type: "TIME_IN",
    qrData: "ssh-group-attendance-01",
    createdAt: "2026-11-18T01:08:47.999Z",
  },
  {
    id: "system-0001-0026-ATT-0000-0024",
    userId: "system-0001-0026",
    companyId: "system-0001",
    scanDate: "2026-11-18",
    scanTime: "8:06:38 AM",
    type: "TIME_IN",
    qrData: "ssh-group-attendance-01",
    createdAt: "2026-11-18T01:06:38.547Z",
  },
];

function cleanTime(t) {
  return (t || "")
    .replace(/[\u202F\u00A0]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseTuples(sql) {
  const insertIdx = sql.indexOf("VALUES");
  const valuesPart = sql.slice(insertIdx + 6).trim();
  const results = [];
  let i = 0;
  while (i < valuesPart.length) {
    while (i < valuesPart.length && valuesPart[i] !== "(") i++;
    if (i >= valuesPart.length) break;
    i++;
    const row = [];
    let cur = "";
    let inString = false;
    while (i < valuesPart.length) {
      const c = valuesPart[i];
      if (inString) {
        if (c === "'") {
          if (valuesPart[i + 1] === "'") {
            cur += "'";
            i += 2;
            continue;
          } else {
            inString = false;
            i++;
            continue;
          }
        } else {
          cur += c;
          i++;
        }
      } else {
        if (c === "'") {
          inString = true;
          i++;
        } else if (c === ",") {
          row.push(cur.trim() === "null" ? null : cur.trim());
          cur = "";
          i++;
        } else if (c === ")") {
          row.push(cur.trim() === "null" ? null : cur.trim());
          results.push(row);
          i++;
          break;
        } else {
          cur += c;
          i++;
        }
      }
    }
  }
  return results;
}

async function syncAllToD1() {
  console.log("Fetching existing AttendanceLogs from Cloudflare D1...");
  const existing = await d1.query(
    "SELECT id, userId, scanDate, scanTime FROM AttendanceLog WHERE userId LIKE 'system-0001%';",
  );
  const existingKeys = new Set();
  for (const e of existing) {
    existingKeys.add(`${e.userId}_${e.scanDate}_${cleanTime(e.scanTime)}`);
    existingKeys.add(e.id);
  }
  console.log(`Found ${existing.length} existing records in D1.`);

  const insertSql = `INSERT OR REPLACE INTO AttendanceLog (id, userId, companyId, scanDate, scanTime, type, qrData, createdAt, remark, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

  let insertedCount = 0;

  // 1. Insert today's 2026-11-18 records if missing
  for (const r of todayRecords) {
    const key = `${r.userId}_${r.scanDate}_${cleanTime(r.scanTime)}`;
    if (!existingKeys.has(key) && !existingKeys.has(r.id)) {
      await d1.execute(insertSql, [
        r.id,
        r.userId,
        r.companyId,
        r.scanDate,
        r.scanTime,
        r.type,
        r.qrData,
        r.createdAt,
        null,
        null,
      ]);
      existingKeys.add(key);
      existingKeys.add(r.id);
      insertedCount++;
      console.log(
        `[D1 Inserted 2026-11-18] ${r.userId} (${r.scanDate} ${r.scanTime}) -> ${r.id}`,
      );
    }
  }

  // 2. Insert missing November records from rawSql
  const rows = parseTuples(rawSql);
  for (const r of rows) {
    const staffId = r[0];
    const sysId = r[12];
    if (!sysId || !sysId.startsWith("system-0001")) continue;

    let attList = [];
    try {
      if (r[10]) attList = JSON.parse(r[10]);
    } catch {}

    const novRecords = attList.filter(
      (a) => a.date && a.date.startsWith("2026-11"),
    );
    // Sort chronological
    novRecords.sort(
      (a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0),
    );

    for (const a of novRecords) {
      const cTime = cleanTime(a.time);
      const key = `${sysId}_${a.date}_${cTime}`;
      if (!existingKeys.has(key) && !existingKeys.has(a.id)) {
        // Standardize ID format: system-0001-{staffId}-ATT-0000-{seq}
        let finalId = a.id;
        if (!finalId.startsWith(sysId)) {
          // Extract trailing digits
          const numMatch = (finalId || "").match(/(\d+)$/);
          const seq = numMatch ? numMatch[1].padStart(4, "0") : "0001";
          finalId = `${sysId}-ATT-0000-${seq}`;
        }
        const normType = (a.type || "time-in").toUpperCase().replace(/-/g, "_");
        await d1.execute(insertSql, [
          finalId,
          sysId,
          "system-0001",
          a.date,
          cTime,
          normType,
          a.qr_data || "ssh-group-attendance-01",
          a.timestamp || new Date().toISOString(),
          null,
          null,
        ]);
        existingKeys.add(key);
        existingKeys.add(finalId);
        insertedCount++;
        console.log(
          `[D1 Inserted Nov] ${sysId} (${a.date} ${cTime}) -> ${finalId}`,
        );
      }
    }
  }

  console.log(
    `\n🎉 Total newly inserted records into Cloudflare D1: ${insertedCount}`,
  );
  const finalLogs = await d1.query(
    "SELECT COUNT(*) as total FROM AttendanceLog WHERE userId LIKE 'system-0001%';",
  );
  console.log(
    `Total AttendanceLogs in Cloudflare D1 for system-0001: ${finalLogs[0]?.total}`,
  );
}

syncAllToD1().catch(console.error);
