const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const sqlPath =
  "C:/Users/itlan/.gemini/antigravity/brain/e31b88d8-d9da-4559-8dc0-11af3467fbc4/.user_uploaded/media_1794629081382_2801f477.sql";
const outputSqlPath = path.join(
  __dirname,
  "../prisma/november_attendance_system_0001.sql",
);

function parseSqlValues(content) {
  const valuesIndex = content.indexOf("VALUES");
  if (valuesIndex === -1) return [];
  const afterValues = content.slice(valuesIndex + 6).trim();

  const rows = [];
  let inString = false;
  let currentVal = "";
  let currentRow = [];
  let depth = 0;

  for (let i = 0; i < afterValues.length; i++) {
    const char = afterValues[i];

    if (!inString) {
      if (char === "(") {
        depth++;
        if (depth === 1) {
          currentRow = [];
          currentVal = "";
          continue;
        }
      } else if (char === ")") {
        depth--;
        if (depth === 0) {
          currentRow.push(currentVal.trim() === "null" ? null : currentVal);
          rows.push(currentRow);
          currentRow = [];
          currentVal = "";
          continue;
        }
      } else if (char === "," && depth === 1) {
        currentRow.push(currentVal.trim() === "null" ? null : currentVal);
        currentVal = "";
        continue;
      } else if (char === "'") {
        inString = true;
        currentVal = "";
        continue;
      } else if (char === ";" && depth === 0) {
        break;
      }
      currentVal += char;
    } else {
      if (char === "'") {
        if (afterValues[i + 1] === "'") {
          currentVal += "'";
          i++;
        } else {
          inString = false;
        }
      } else {
        currentVal += char;
      }
    }
  }

  return rows;
}

async function exportSql() {
  const sqlContent = fs.readFileSync(sqlPath, "utf8");
  const rows = parseSqlValues(sqlContent);
  const system0001Rows = rows.filter(
    (r) => r[12] && r[12].startsWith("system-0001"),
  );

  const sqlStatements = [
    "-- November 2026 AttendanceLog for system-0001",
    "-- Generated from Supabase ssh_group_staff_users attendance column",
    "",
  ];

  for (const r of system0001Rows) {
    const staffId = r[0];
    const name = r[1];
    const systemId = r[12];
    let attList = [];
    try {
      attList = JSON.parse(r[10] || "[]");
    } catch (e) {
      continue;
    }

    const novRecords = attList.filter((item) => {
      const d =
        item.date || (item.timestamp ? item.timestamp.split("T")[0] : "");
      return d.includes("-11-");
    });

    if (novRecords.length === 0) continue;

    novRecords.sort((a, b) => {
      const timeA = a.timestamp
        ? new Date(a.timestamp).getTime()
        : new Date(a.date + " " + (a.time || "00:00:00")).getTime();
      const timeB = b.timestamp
        ? new Date(b.timestamp).getTime()
        : new Date(b.date + " " + (b.time || "00:00:00")).getTime();
      return timeA - timeB;
    });

    sqlStatements.push(
      `-- User: ${systemId} (${staffId} - ${name}) [${novRecords.length} records]`,
    );

    for (let i = 0; i < novRecords.length; i++) {
      const item = novRecords[i];
      const seq = String(i + 1).padStart(4, "0");
      const logId = `${systemId}-ATT-0000-${seq}`;
      const rawType = (item.type || "time-in").toString();
      const normalizedType = rawType.toUpperCase().replace(/-/g, "_");
      const scanDate = item.date || item.timestamp.split("T")[0];
      const scanTime = item.time || "";
      const qrData = item.qr_data || item.qrData || "ssh-group-attendance-01";
      const createdAt = item.timestamp || `${scanDate}T00:00:00.000Z`;

      sqlStatements.push(
        `INSERT OR REPLACE INTO AttendanceLog (id, userId, companyId, scanDate, scanTime, type, qrData, createdAt) ` +
          `VALUES ('${logId}', '${systemId}', 'system-0001', '${scanDate}', '${scanTime}', '${normalizedType}', '${qrData}', '${createdAt}');`,
      );
    }
    sqlStatements.push("");
  }

  fs.writeFileSync(outputSqlPath, sqlStatements.join("\n"), "utf8");
  console.log(`✅ Exported standalone SQL to ${outputSqlPath}`);
}

exportSql();
