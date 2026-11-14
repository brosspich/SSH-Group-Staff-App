require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const {
  CloudflareD1Client,
} = require("../dist/infrastructure/database/d1Client.js");

const prisma = new PrismaClient();
const d1 = new CloudflareD1Client();

async function syncToD1() {
  console.log(
    "🔄 Fetching system-0001 November AttendanceLogs from local dev.db...",
  );
  const logs = await prisma.attendanceLog.findMany({
    where: {
      userId: { startsWith: "system-0001" },
      scanDate: { startsWith: "2026-11" },
    },
    orderBy: { id: "asc" },
  });

  console.log(
    `📌 Found ${logs.length} records in local dev.db to sync to Cloudflare D1.`,
  );

  if (logs.length === 0) {
    console.log("⚠️ No records to sync.");
    return;
  }

  const sql = `INSERT OR REPLACE INTO AttendanceLog (id, userId, companyId, scanDate, scanTime, type, qrData, createdAt, image, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

  const CONCURRENCY = 10;
  let synced = 0;

  for (let i = 0; i < logs.length; i += CONCURRENCY) {
    const chunk = logs.slice(i, i + CONCURRENCY);
    await Promise.all(
      chunk.map((log) =>
        d1.execute(sql, [
          log.id,
          log.userId,
          log.companyId || "system-0001",
          log.scanDate,
          log.scanTime,
          log.type,
          log.qrData || "ssh-group-attendance-01",
          log.createdAt
            ? log.createdAt.toISOString()
            : new Date().toISOString(),
          log.image || null,
          log.remark || null,
        ]),
      ),
    );
    synced += chunk.length;
    process.stdout.write(
      `\r   Synced ${synced} / ${logs.length} records to Cloudflare D1...`,
    );
  }

  console.log("\n");
  // Verify on D1
  const verify = await d1.query(
    "SELECT COUNT(*) as count FROM AttendanceLog WHERE userId LIKE 'system-0001%' AND scanDate LIKE '2026-11%';",
  );
  console.log(
    `🎉 Verification on Cloudflare D1: ${verify[0]?.count} records confirmed!`,
  );
}

syncToD1()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
