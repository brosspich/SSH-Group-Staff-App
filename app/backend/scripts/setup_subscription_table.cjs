require("dotenv").config({ path: __dirname + "/../.env" });
const { PrismaClient } = require("@prisma/client");
const { CloudflareD1Client } = require("../dist/infrastructure/database/d1Client.js");

const prisma = new PrismaClient();
const d1 = new CloudflareD1Client();

async function run() {
  console.log("🚀 Setting up Subscription table in local SQLite (dev.db) & Cloudflare D1...");

  const createTableSql = `
    CREATE TABLE IF NOT EXISTS Subscription (
      id TEXT PRIMARY KEY,
      system_id TEXT NOT NULL,
      plan TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createIndexSql = `
    CREATE INDEX IF NOT EXISTS idx_subscription_system_id ON Subscription (system_id);
  `;

  const seedRecords = [
    { id: "SUB-0001", system_id: "system-0001", plan: "1 Year", start_date: "2026-07-01", end_date: "2027-07-01", createdAt: "2026-07-02 09:17:54" },
    { id: "SUB-0002", system_id: "system-0002", plan: "1 Year", start_date: "2026-07-01", end_date: "2027-07-02", createdAt: "2026-07-02 09:40:14" },
    { id: "SUB-0003", system_id: "system-0003", plan: "1 Year", start_date: "2026-07-13", end_date: "2027-07-13", createdAt: "2026-07-13 07:37:09" },
    { id: "SUB-0004", system_id: "system-0004", plan: "1 Year", start_date: "2026-07-23", end_date: "2027-07-23", createdAt: "2026-08-03 02:21:22" },
    { id: "SUB-0005", system_id: "system-0005", plan: "1 Year", start_date: "2026-07-22", end_date: "2027-07-22", createdAt: "2026-08-04 01:56:00" },
    { id: "SUB-0005.1", system_id: "system-0005.1", plan: "1 Year", start_date: "2026-07-22", end_date: "2027-07-22", createdAt: "2026-09-24 03:36:58" },
    { id: "SUB-0006", system_id: "system-0006", plan: "1 Year", start_date: "2026-08-28", end_date: "2027-08-28", createdAt: "2026-08-26 08:13:28" },
    { id: "SUB-0006.1", system_id: "system-0006.1", plan: "1 Year", start_date: "2026-09-08", end_date: "2027-09-08", createdAt: "2026-09-08 07:12:31" },
  ];

  // 1. Local SQLite dev.db
  console.log("📦 1. Applying to local SQLite dev.db...");
  try {
    await prisma.$executeRawUnsafe(createTableSql);
    await prisma.$executeRawUnsafe(createIndexSql);

    for (const item of seedRecords) {
      await prisma.$executeRawUnsafe(
        `INSERT OR REPLACE INTO Subscription (id, system_id, plan, start_date, end_date, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
        item.id,
        item.system_id,
        item.plan,
        item.start_date,
        item.end_date,
        item.createdAt
      );
    }
    console.log("✅ Local SQLite dev.db Subscription table created & seeded successfully.");
  } catch (err) {
    console.error("❌ Local SQLite error:", err.message);
  }

  // 2. Cloudflare D1
  console.log("☁️ 2. Applying to Cloudflare D1...");
  try {
    await d1.execute(createTableSql);
    await d1.execute(createIndexSql);

    for (const item of seedRecords) {
      await d1.execute(
        `INSERT OR REPLACE INTO Subscription (id, system_id, plan, start_date, end_date, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
        [item.id, item.system_id, item.plan, item.start_date, item.end_date, item.createdAt]
      );
    }
    console.log("✅ Cloudflare D1 Subscription table created & seeded successfully.");
  } catch (err) {
    console.error("❌ Cloudflare D1 error:", err.message);
  }

  // Verification
  console.log("🔍 Verifying Subscription records...");
  const localRows = await prisma.$queryRawUnsafe("SELECT * FROM Subscription");
  console.log(`Local dev.db records count: ${localRows.length}`);

  try {
    const d1Rows = await d1.query("SELECT * FROM Subscription");
    console.log(`Cloudflare D1 records count: ${d1Rows.length}`);
  } catch (d1Err) {
    console.log("D1 query note:", d1Err.message);
  }

  await prisma.$disconnect();
}

run().catch(console.error);
