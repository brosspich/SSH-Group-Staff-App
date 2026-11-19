const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { PrismaClient } = require("@prisma/client");
const {
  CloudflareD1Client,
} = require("../dist/infrastructure/database/d1Client.js");

const prisma = new PrismaClient();
const d1 = new CloudflareD1Client();

// The 6 new evening records from Supabase on 2026-11-18:
const eveningNov18 = [
  {
    id: "system-0001-0020-ATT-0000-0021",
    userId: "system-0001-0020",
    companyId: "system-0001",
    scanDate: "2026-11-18",
    scanTime: "5:04:25 PM",
    type: "TIME_OUT",
    qrData: "ssh-group-attendance-01",
    createdAt: "2026-11-18T10:04:25.180Z",
  },
  {
    id: "system-0001-0026-ATT-0000-0025",
    userId: "system-0001-0026",
    companyId: "system-0001",
    scanDate: "2026-11-18",
    scanTime: "5:04:07 PM",
    type: "TIME_OUT",
    qrData: "ssh-group-attendance-01",
    createdAt: "2026-11-18T10:04:07.269Z",
  },
  {
    id: "system-0001-0017-ATT-0000-0024",
    userId: "system-0001-0017",
    companyId: "system-0001",
    scanDate: "2026-11-18",
    scanTime: "5:06:22 PM",
    type: "TIME_OUT",
    qrData: "ssh-group-attendance-01",
    createdAt: "2026-11-18T10:06:22.322Z",
  },
  {
    id: "system-0001-0019-ATT-0000-0013",
    userId: "system-0001-0019",
    companyId: "system-0001",
    scanDate: "2026-11-18",
    scanTime: "5:06:27 PM",
    type: "TIME_OUT",
    qrData: "ssh-group-attendance-01",
    createdAt: "2026-11-18T10:06:27.797Z",
  },
  {
    id: "system-0001-0015-ATT-0000-0014",
    userId: "system-0001-0015",
    companyId: "system-0001",
    scanDate: "2026-11-18",
    scanTime: "5:06:35 PM",
    type: "TIME_OUT",
    qrData: "ssh-group-attendance-01",
    createdAt: "2026-11-18T10:06:35.045Z",
  },
  {
    id: "system-0001-0016-ATT-0000-0027",
    userId: "system-0001-0016",
    companyId: "system-0001",
    scanDate: "2026-11-18",
    scanTime: "5:07:14 PM",
    type: "TIME_OUT",
    qrData: "ssh-group-attendance-01",
    createdAt: "2026-11-18T10:07:14.875Z",
  },
];

// The Nov 19 records to update to next sequential ID so chronological order is maintained:
const nov19Updates = [
  {
    oldId: "system-0001-0016-ATT-0000-0027",
    newId: "system-0001-0016-ATT-0000-0028",
  },
  {
    oldId: "system-0001-0017-ATT-0000-0024",
    newId: "system-0001-0017-ATT-0000-0025",
  },
  {
    oldId: "system-0001-0020-ATT-0000-0021",
    newId: "system-0001-0020-ATT-0000-0022",
  },
  {
    oldId: "system-0001-0015-ATT-0000-0014",
    newId: "system-0001-0015-ATT-0000-0015",
  },
  {
    oldId: "system-0001-0026-ATT-0000-0025",
    newId: "system-0001-0026-ATT-0000-0026",
  },
  {
    oldId: "system-0001-0019-ATT-0000-0013",
    newId: "system-0001-0019-ATT-0000-0014",
  },
];

async function run() {
  console.log("=== STEP 1: Updating Nov 19 IDs in Cloudflare D1 ===");
  for (const u of nov19Updates) {
    try {
      await d1.query(`UPDATE "AttendanceLog" SET "id" = '${u.newId}' WHERE "id" = '${u.oldId}';`);
      console.log(`  Updated D1: ${u.oldId} -> ${u.newId}`);
    } catch (e) {
      console.error(`  Error updating ${u.oldId}:`, e.message);
    }
  }

  console.log("\n=== STEP 2: Inserting Nov 18 Evening Records into Cloudflare D1 ===");
  const sqlValues = eveningNov18.map(r => 
    `('${r.id}', '${r.userId}', '${r.companyId}', '${r.scanDate}', '${r.scanTime}', '${r.type}', '${r.qrData}', '${r.createdAt}', NULL, NULL)`
  ).join(",\n");

  const insertSql = `INSERT INTO "AttendanceLog"("id", "userId", "companyId", "scanDate", "scanTime", "type", "qrData", "createdAt", "remark", "image") VALUES\n${sqlValues};`;
  
  await d1.query(insertSql);
  console.log("✅ Successfully inserted Nov 18 evening records into Cloudflare D1.");

  console.log("\n=== STEP 3: Syncing to local Prisma SQLite dev.db ===");
  for (const u of nov19Updates) {
    try {
      await prisma.attendanceLog.update({
        where: { id: u.oldId },
        data: { id: u.newId },
      });
      console.log(`  Updated Prisma: ${u.oldId} -> ${u.newId}`);
    } catch (e) {
      console.log(`  Prisma update skipped or already updated: ${e.message}`);
    }
  }

  for (const r of eveningNov18) {
    await prisma.attendanceLog.upsert({
      where: { id: r.id },
      create: {
        id: r.id,
        userId: r.userId,
        companyId: r.companyId,
        scanDate: r.scanDate,
        scanTime: r.scanTime,
        type: r.type,
        qrData: r.qrData,
        createdAt: new Date(r.createdAt),
      },
      update: {
        scanDate: r.scanDate,
        scanTime: r.scanTime,
        type: r.type,
        qrData: r.qrData,
        createdAt: new Date(r.createdAt),
      },
    });
    console.log(`  Upserted Prisma: ${r.id} (${r.userId} ${r.scanTime})`);
  }

  console.log("\n=== STEP 4: Verifying Cloudflare D1 records for 2026-11-18 and 2026-11-19 ===");
  const check18 = await d1.query(
    "SELECT id, userId, scanDate, scanTime, type FROM AttendanceLog WHERE scanDate = '2026-11-18' AND userId LIKE 'system-0001%' ORDER BY scanTime ASC;"
  );
  console.log(`📌 Total system-0001 records on Nov 18 in D1: ${check18.length}`);
  check18.forEach(r => console.log(`   ${r.id} | ${r.userId} | ${r.scanTime} | ${r.type}`));

  const check19 = await d1.query(
    "SELECT id, userId, scanDate, scanTime, type FROM AttendanceLog WHERE scanDate = '2026-11-19' AND userId LIKE 'system-0001%' ORDER BY scanTime ASC;"
  );
  console.log(`\n📌 Total system-0001 records on Nov 19 in D1: ${check19.length}`);
  check19.forEach(r => console.log(`   ${r.id} | ${r.userId} | ${r.scanTime} | ${r.type}`));
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
