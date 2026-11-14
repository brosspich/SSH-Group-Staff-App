const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const sqlPath =
  "C:/Users/itlan/.gemini/antigravity/brain/e31b88d8-d9da-4559-8dc0-11af3467fbc4/.user_uploaded/media_1794629081382_2801f477.sql";

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

async function main() {
  console.log("🔄 Reading SQL dump file...");
  const sqlContent = fs.readFileSync(sqlPath, "utf8");
  const rows = parseSqlValues(sqlContent);
  console.log(`✅ Parsed ${rows.length} total rows from SQL.`);

  // Filter users belonging to system-0001
  const system0001Rows = rows.filter(
    (r) => r[12] && r[12].startsWith("system-0001"),
  );
  console.log(
    `📌 Found ${system0001Rows.length} users belonging to system-0001.`,
  );

  let totalInserted = 0;
  const summary = [];

  for (const r of system0001Rows) {
    const staffId = r[0];
    const name = r[1];
    const systemId = r[12];
    let attList = [];
    try {
      attList = JSON.parse(r[10] || "[]");
    } catch (e) {
      console.error(`❌ Error parsing attendance for ${systemId}:`, e.message);
      continue;
    }

    // Filter November only
    const novRecords = attList.filter((item) => {
      const d =
        item.date || (item.timestamp ? item.timestamp.split("T")[0] : "");
      return d.includes("-11-");
    });

    if (novRecords.length === 0) {
      continue;
    }

    // Sort chronologically ascending by date and time/timestamp
    novRecords.sort((a, b) => {
      const timeA = a.timestamp
        ? new Date(a.timestamp).getTime()
        : new Date(a.date + " " + (a.time || "00:00:00")).getTime();
      const timeB = b.timestamp
        ? new Date(b.timestamp).getTime()
        : new Date(b.date + " " + (b.time || "00:00:00")).getTime();
      return timeA - timeB;
    });

    const userSummary = {
      systemId,
      staffId,
      name,
      count: novRecords.length,
      firstId: "",
      lastId: "",
    };

    for (let i = 0; i < novRecords.length; i++) {
      const item = novRecords[i];
      const seq = String(i + 1).padStart(4, "0");
      // ID format requested by user: e.g. system-0001-0001-ATT-0000-0001
      const logId = `${systemId}-ATT-0000-${seq}`;

      if (i === 0) userSummary.firstId = logId;
      if (i === novRecords.length - 1) userSummary.lastId = logId;

      const rawType = (item.type || "time-in").toString();
      const normalizedType = rawType.toUpperCase().replace(/-/g, "_");

      let createdAt = new Date();
      if (item.timestamp) {
        createdAt = new Date(item.timestamp);
      } else if (item.date) {
        createdAt = new Date(`${item.date}T00:00:00.000Z`);
      }

      await prisma.attendanceLog.upsert({
        where: { id: logId },
        update: {
          userId: systemId,
          companyId: "system-0001",
          scanDate: item.date || item.timestamp.split("T")[0],
          scanTime: item.time || "",
          type: normalizedType,
          qrData: item.qr_data || item.qrData || "ssh-group-attendance-01",
          image: item.image || null,
          remark: item.remark || null,
          createdAt: createdAt,
        },
        create: {
          id: logId,
          userId: systemId,
          companyId: "system-0001",
          scanDate: item.date || item.timestamp.split("T")[0],
          scanTime: item.time || "",
          type: normalizedType,
          qrData: item.qr_data || item.qrData || "ssh-group-attendance-01",
          image: item.image || null,
          remark: item.remark || null,
          createdAt: createdAt,
        },
      });

      totalInserted++;
    }

    summary.push(userSummary);
  }

  console.log("\n📊 IMPORT SUMMARY (November AttendanceLogs for system-0001):");
  console.table(summary);
  console.log(
    `\n🎉 Successfully imported ${totalInserted} November AttendanceLog records!`,
  );
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
