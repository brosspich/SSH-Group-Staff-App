const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { PrismaClient } = require("@prisma/client");
const {
  CloudflareD1Client,
} = require("../dist/infrastructure/database/d1Client.js");

const prisma = new PrismaClient();
const d1 = new CloudflareD1Client();

const csvPath =
  "C:/Users/itlan/.gemini/antigravity/brain/e31b88d8-d9da-4559-8dc0-11af3467fbc4/.user_uploaded/media_1794966740865_d340a266.csv";
const sqlBackupPath =
  "C:/Users/itlan/.gemini/antigravity/brain/e31b88d8-d9da-4559-8dc0-11af3467fbc4/.user_uploaded/media_1794966913978_64438678.txt";

function parseCSV(text) {
  const p = [];
  let row = [""];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (c === '"' && inQuotes && next === '"') {
      row[row.length - 1] += '"';
      i++;
    } else if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      row.push("");
    } else if ((c === "\r" || c === "\n") && !inQuotes) {
      if (c === "\r" && next === "\n") i++;
      p.push(row);
      row = [""];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || (row.length === 1 && row[0] !== "")) p.push(row);
  return p;
}

function normalizeTime(t) {
  return t ? t.replace(/[\u202F\u00A0]/g, " ").trim() : "";
}

function normalizeType(type) {
  if (!type) return "TIME_IN";
  const upper = type.toUpperCase().replace("-", "_");
  if (upper.includes("IN")) return "TIME_IN";
  if (upper.includes("OUT")) return "TIME_OUT";
  return "TIME_OTHER";
}

function parseTimeToSeconds(timeStr) {
  const clean = normalizeTime(timeStr);
  const match = clean.match(/^(\d+):(\d+)(?::(\d+))?\s*(AM|PM)?$/i);
  if (!match) return 0;
  let [_, h, m, s, meridian] = match;
  let hours = parseInt(h, 10);
  const mins = parseInt(m, 10);
  const secs = parseInt(s || "0", 10);
  if (meridian) {
    meridian = meridian.toUpperCase();
    if (meridian === "PM" && hours < 12) hours += 12;
    if (meridian === "AM" && hours === 12) hours = 0;
  }
  return hours * 3600 + mins * 60 + secs;
}

async function run() {
  console.log(
    "🚀 Starting import and re-indexing of November attendance for system-0001...",
  );

  // 1. Fetch current D1 records for system-0001 in November
  console.log(
    "📥 Querying existing Cloudflare D1 November records for system-0001...",
  );
  const d1Existing = await d1.query(
    "SELECT * FROM AttendanceLog WHERE userId LIKE 'system-0001%' AND scanDate LIKE '2026-11%' ORDER BY scanDate ASC, createdAt ASC;",
  );
  console.log(`📌 Found ${d1Existing.length} current records in D1.`);

  // 2. Parse CSV from Supabase
  console.log("📄 Reading Supabase CSV file...");
  const csvContent = fs.readFileSync(csvPath, "utf8");
  const csvRows = parseCSV(csvContent);

  const allRecordsByUser = {};

  // Collect records from Supabase CSV
  for (let i = 1; i < csvRows.length; i++) {
    const [systemId, name, username, novAttStr] = csvRows[i];
    if (!systemId || !systemId.startsWith("system-0001")) continue;
    try {
      const records = JSON.parse(novAttStr);
      if (!allRecordsByUser[systemId]) allRecordsByUser[systemId] = [];

      records.forEach((r) => {
        allRecordsByUser[systemId].push({
          userId: systemId,
          companyId: "system-0001",
          scanDate: r.date,
          scanTime: normalizeTime(r.time),
          type: normalizeType(r.type),
          qrData: r.qr_data || "ssh-group-attendance-01",
          createdAt:
            r.timestamp || new Date(`${r.date}T00:00:00Z`).toISOString(),
          remark: null,
          image: null,
        });
      });
    } catch (e) {
      console.error(
        `Error parsing JSON for row ${i} (${systemId}):`,
        e.message,
      );
    }
  }

  // Also collect from SQL backup (media_1794966913978_64438678.txt) to capture any D1 scans on Nov 17/18
  if (fs.existsSync(sqlBackupPath)) {
    console.log("📄 Reading backup SQL file for Nov 17/18 scans...");
    const sqlContent = fs.readFileSync(sqlBackupPath, "utf8");
    const matches = [
      ...sqlContent.matchAll(
        /\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'/g,
      ),
    ];
    console.log(`📌 Found ${matches.length} tuples in backup SQL.`);
    matches.forEach((m) => {
      const [
        _,
        id,
        userId,
        companyId,
        scanDate,
        scanTime,
        type,
        qrData,
        createdAt,
      ] = m;
      if (!userId.startsWith("system-0001")) return;
      if (!scanDate.startsWith("2026-11")) return;
      if (!allRecordsByUser[userId]) allRecordsByUser[userId] = [];
      allRecordsByUser[userId].push({
        userId,
        companyId: companyId || "system-0001",
        scanDate,
        scanTime: normalizeTime(scanTime),
        type: normalizeType(type),
        qrData: qrData || "ssh-group-attendance-01",
        createdAt: createdAt || new Date().toISOString(),
        remark: null,
        image: null,
      });
    });
  }

  // Also collect existing D1 records (if any)
  d1Existing.forEach((r) => {
    const userId = r.userId;
    if (!userId.startsWith("system-0001")) return;
    if (!allRecordsByUser[userId]) allRecordsByUser[userId] = [];
    allRecordsByUser[userId].push({
      userId,
      companyId: r.companyId || "system-0001",
      scanDate: r.scanDate,
      scanTime: normalizeTime(r.scanTime),
      type: normalizeType(r.type),
      qrData: r.qrData || "ssh-group-attendance-01",
      createdAt: r.createdAt
        ? r.createdAt instanceof Date
          ? r.createdAt.toISOString()
          : String(r.createdAt)
        : new Date().toISOString(),
      remark: r.remark || null,
      image: r.image || null,
    });
  });

  // 3. Deduplicate and Sort chronologically ascending
  const finalAttendanceLogs = [];
  const stats = [];

  for (const userId of Object.keys(allRecordsByUser).sort()) {
    const rawList = allRecordsByUser[userId];
    const uniqueMap = new Map();

    for (const item of rawList) {
      // Deduplication key by date, hour:minute, AM/PM, and type
      const hmMatch = item.scanTime.match(/^(\d+:\d+).*?(AM|PM)$/i);
      const approxTime = hmMatch
        ? `${hmMatch[1]} ${hmMatch[2].toUpperCase()}`
        : item.scanTime;
      const dedupeKey = `${item.scanDate}_${approxTime}_${item.type}`;

      if (!uniqueMap.has(dedupeKey)) {
        uniqueMap.set(dedupeKey, item);
      } else {
        const existing = uniqueMap.get(dedupeKey);
        if (
          (!existing.createdAt ||
            existing.createdAt.endsWith("T00:00:00.000Z")) &&
          item.createdAt
        ) {
          uniqueMap.set(dedupeKey, item);
        }
      }
    }

    const uniqueList = Array.from(uniqueMap.values());

    // Sort chronologically ascending
    uniqueList.sort((a, b) => {
      if (a.scanDate !== b.scanDate) {
        return a.scanDate.localeCompare(b.scanDate);
      }
      return parseTimeToSeconds(a.scanTime) - parseTimeToSeconds(b.scanTime);
    });

    // Assign sequential ID: system-0001-XXXX-ATT-0000-YYYY
    uniqueList.forEach((r, idx) => {
      const seq = String(idx + 1).padStart(4, "0");
      const newId = `${userId}-ATT-0000-${seq}`;
      r.id = newId;
      finalAttendanceLogs.push(r);
    });

    stats.push({
      userId,
      count: uniqueList.length,
      firstId: uniqueList[0].id,
      firstDate: `${uniqueList[0].scanDate} ${uniqueList[0].scanTime}`,
      lastId: uniqueList[uniqueList.length - 1].id,
      lastDate: `${uniqueList[uniqueList.length - 1].scanDate} ${uniqueList[uniqueList.length - 1].scanTime}`,
    });
  }

  console.log(
    `\n📊 Prepared ${finalAttendanceLogs.length} total records across ${stats.length} users.`,
  );
  console.table(stats);

  // 4. Update Cloudflare D1
  console.log(
    "\n🧹 Clearing old November records for system-0001 in Cloudflare D1...",
  );
  await d1.execute(
    "DELETE FROM AttendanceLog WHERE userId LIKE 'system-0001%' AND scanDate LIKE '2026-11%';",
  );
  console.log("✅ Cleared old D1 November records.");

  console.log(
    `📤 Uploading ${finalAttendanceLogs.length} records to Cloudflare D1...`,
  );
  const insertSql = `INSERT INTO AttendanceLog (id, userId, companyId, scanDate, scanTime, type, qrData, createdAt, image, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
  const CONCURRENCY = 10;
  for (let i = 0; i < finalAttendanceLogs.length; i += CONCURRENCY) {
    const chunk = finalAttendanceLogs.slice(i, i + CONCURRENCY);
    await Promise.all(
      chunk.map((log) =>
        d1.execute(insertSql, [
          log.id,
          log.userId,
          log.companyId,
          log.scanDate,
          log.scanTime,
          log.type,
          log.qrData,
          log.createdAt,
          log.image,
          log.remark,
        ]),
      ),
    );
    process.stdout.write(
      `  -> Uploaded ${Math.min(i + CONCURRENCY, finalAttendanceLogs.length)} / ${finalAttendanceLogs.length} records\r`,
    );
  }
  console.log("\n✅ Cloudflare D1 upload complete!");

  // 5. Update local SQLite dev.db via Prisma
  console.log("\n💾 Syncing to local Prisma SQLite dev.db...");
  await prisma.attendanceLog.deleteMany({
    where: {
      userId: { startsWith: "system-0001" },
      scanDate: { startsWith: "2026-11" },
    },
  });

  const prismaData = finalAttendanceLogs.map((log) => ({
    id: log.id,
    userId: log.userId,
    companyId: log.companyId,
    scanDate: log.scanDate,
    scanTime: log.scanTime,
    type: log.type,
    qrData: log.qrData,
    createdAt: new Date(log.createdAt),
    image: log.image,
    remark: log.remark,
  }));

  // Prisma createMany in SQLite supports batching
  await prisma.attendanceLog.createMany({
    data: prismaData,
  });
  console.log(`✅ Synced ${prismaData.length} records to local Prisma dev.db.`);

  // 6. Verify in Cloudflare D1
  console.log("\n🔍 Verifying in Cloudflare D1...");
  const countRes = await d1.queryFirst(
    "SELECT COUNT(*) as total FROM AttendanceLog WHERE userId LIKE 'system-0001%' AND scanDate LIKE '2026-11%';",
  );
  console.log(
    `🎉 Cloudflare D1 now has ${countRes.total} November records for system-0001!`,
  );

  // Sample check for system-0001-0022 and system-0001-0007
  const sample22 = await d1.query(
    "SELECT id, scanDate, scanTime, type FROM AttendanceLog WHERE userId = 'system-0001-0022' ORDER BY id ASC LIMIT 5;",
  );
  console.log("\nSample for system-0001-0022 (first 5):");
  console.log(sample22);

  const sample07 = await d1.query(
    "SELECT id, scanDate, scanTime, type FROM AttendanceLog WHERE userId = 'system-0001-0007' ORDER BY id ASC LIMIT 5;",
  );
  console.log("\nSample for system-0001-0007 (first 5):");
  console.log(sample07);
}

run()
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
