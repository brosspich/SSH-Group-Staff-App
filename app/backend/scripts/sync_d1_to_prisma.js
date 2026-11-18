const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { PrismaClient } = require("@prisma/client");
const {
  CloudflareD1Client,
} = require("../dist/infrastructure/database/d1Client.js");

const prisma = new PrismaClient();
const d1 = new CloudflareD1Client();

async function syncD1ToPrisma() {
  console.log("Fetching all AttendanceLogs from Cloudflare D1...");
  const d1Logs = await d1.query("SELECT * FROM AttendanceLog;");
  console.log(`Found ${d1Logs.length} total AttendanceLogs in D1.`);

  let upserted = 0;
  for (const log of d1Logs) {
    try {
      await prisma.attendanceLog.upsert({
        where: { id: log.id },
        create: {
          id: log.id,
          userId: log.userId,
          companyId: log.companyId || "system-0001",
          scanDate: log.scanDate,
          scanTime: log.scanTime,
          type: log.type,
          qrData: log.qrData,
          createdAt: log.createdAt ? new Date(log.createdAt) : new Date(),
          image: log.image || null,
          remark: log.remark || null,
        },
        update: {
          userId: log.userId,
          companyId: log.companyId || "system-0001",
          scanDate: log.scanDate,
          scanTime: log.scanTime,
          type: log.type,
          qrData: log.qrData,
          createdAt: log.createdAt ? new Date(log.createdAt) : undefined,
          image: log.image || null,
          remark: log.remark || null,
        },
      });
      upserted++;
    } catch (err) {
      // ignore
    }
  }

  console.log(`✅ Upserted ${upserted} records into local Prisma dev.db.`);
}

syncD1ToPrisma().finally(() => prisma.$disconnect());
