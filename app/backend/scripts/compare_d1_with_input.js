const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const {
  CloudflareD1Client,
} = require("../dist/infrastructure/database/d1Client.js");
const { rawSql } = require("./raw_users_input.js");

const d1 = new CloudflareD1Client();

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

function cleanTime(t) {
  return (t || "")
    .replace(/[\u202F\u00A0]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  console.log(
    "Fetching all AttendanceLogs from Cloudflare D1 for system-0001 November...",
  );
  const d1Logs = await d1.query(
    "SELECT id, userId, scanDate, scanTime, type, createdAt FROM AttendanceLog WHERE userId LIKE 'system-0001%' AND scanDate LIKE '2026-11%';",
  );
  console.log(
    `Cloudflare D1 currently has ${d1Logs.length} November records for system-0001.`,
  );

  const d1KeySet = new Set();
  for (const l of d1Logs) {
    // Key by userId + scanDate + cleanTime
    d1KeySet.add(`${l.userId}_${l.scanDate}_${cleanTime(l.scanTime)}`);
    // Also key by id
    d1KeySet.add(l.id);
  }

  const rows = parseTuples(rawSql);
  const missingRecords = [];

  for (const r of rows) {
    const staffId = r[0];
    const name = r[1];
    const sysId = r[12];
    if (!sysId || !sysId.startsWith("system-0001")) continue;

    let attList = [];
    try {
      if (r[10]) attList = JSON.parse(r[10]);
    } catch {}

    const novRecords = attList.filter(
      (a) => a.date && a.date.startsWith("2026-11"),
    );
    for (const a of novRecords) {
      const cTime = cleanTime(a.time);
      const compositeKey = `${sysId}_${a.date}_${cTime}`;
      if (!d1KeySet.has(compositeKey) && !d1KeySet.has(a.id)) {
        missingRecords.push({
          staffId,
          name,
          sysId,
          ...a,
          cleanTime: cTime,
        });
      }
    }
  }

  console.log(
    `\nFound ${missingRecords.length} records in SQL that are NOT yet in Cloudflare D1:`,
  );
  const missingByUser = {};
  for (const m of missingRecords) {
    missingByUser[m.staffId] = (missingByUser[m.staffId] || 0) + 1;
    console.log(
      `[Missing] User ${m.staffId} (${m.name}) -> Date: ${m.date}, Time: ${m.cleanTime}, Type: ${m.type}`,
    );
  }
  console.log("\nMissing summary by user:", missingByUser);
}

main().catch((err) => console.error("Error:", err));
