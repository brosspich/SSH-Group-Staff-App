require("dotenv").config({ path: __dirname + "/../.env" });
const { PrismaClient } = require("@prisma/client");
const {
  CloudflareD1Client,
} = require("../dist/infrastructure/database/d1Client.js");

const prisma = new PrismaClient();
const d1 = new CloudflareD1Client();

async function syncCompanyToD1() {
  console.log("🔄 Starting Company Sync: Local dev.db -> Cloudflare D1...");

  try {
    const companies = await prisma.company.findMany();
    console.log(`📦 Found ${companies.length} Companies in local dev.db`);

    let companyCount = 0;
    for (const c of companies) {
      const createdAt = c.createdAt
        ? new Date(c.createdAt).toISOString()
        : new Date().toISOString();
      const updatedAt = c.updatedAt
        ? new Date(c.updatedAt).toISOString()
        : new Date().toISOString();

      await d1.execute(
        `INSERT OR REPLACE INTO Company (id, name, qrCodes, location, telegramBotToken, telegramChatId, timeIn, timeOut, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          c.id,
          c.name,
          c.qrCodes || null,
          c.location || null,
          c.telegramBotToken || null,
          c.telegramChatId || null,
          c.timeIn || null,
          c.timeOut || null,
          createdAt,
          updatedAt,
        ],
      );
      companyCount++;
    }

    console.log(`\n✅ Sync Completed:`);
    console.log(`   - Companies upserted to D1: ${companyCount}`);

    const d1Companies = await d1.query(
      "SELECT id, name, timeIn, timeOut FROM Company ORDER BY id ASC",
    );
    console.log(`\n🔍 Cloudflare D1 now has ${d1Companies.length} Companies:`);
    console.table(d1Companies);

    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Company Sync to D1 error:", err);
    process.exit(1);
  }
}

syncCompanyToD1();
