require("dotenv").config({ path: __dirname + "/../.env" });
const { PrismaClient } = require("@prisma/client");
const {
  CloudflareD1Client,
} = require("../dist/infrastructure/database/d1Client.js");

const prisma = new PrismaClient();
const d1 = new CloudflareD1Client();

async function syncCompanyToLocal() {
  console.log("⬇️ Starting Company Pull: Cloudflare D1 -> Local dev.db...");

  try {
    const d1Companies = await d1.query("SELECT * FROM Company");
    console.log(`☁️ Found ${d1Companies.length} Companies in Cloudflare D1`);

    let companyCount = 0;
    for (const c of d1Companies) {
      const createdAt = c.createdAt ? new Date(c.createdAt) : new Date();
      const updatedAt = c.updatedAt ? new Date(c.updatedAt) : new Date();

      await prisma.company.upsert({
        where: { id: c.id },
        update: {
          name: c.name,
          qrCodes: c.qrCodes || null,
          location: c.location || null,
          telegramBotToken: c.telegramBotToken || null,
          telegramChatId: c.telegramChatId || null,
          timeIn: c.timeIn || null,
          timeOut: c.timeOut || null,
          createdAt,
          updatedAt,
        },
        create: {
          id: c.id,
          name: c.name,
          qrCodes: c.qrCodes || null,
          location: c.location || null,
          telegramBotToken: c.telegramBotToken || null,
          telegramChatId: c.telegramChatId || null,
          timeIn: c.timeIn || null,
          timeOut: c.timeOut || null,
          createdAt,
          updatedAt,
        },
      });
      companyCount++;
    }

    console.log(`\n✅ Pull Completed:`);
    console.log(`   - Companies synced to local dev.db: ${companyCount}`);

    const localCompanies = await prisma.company.findMany({
      select: { id: true, name: true, timeIn: true, timeOut: true },
      orderBy: { id: "asc" },
    });
    console.log(
      `\n🔍 Local dev.db now has ${localCompanies.length} Companies:`,
    );
    console.table(localCompanies);

    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Company Pull from D1 error:", err);
    process.exit(1);
  }
}

syncCompanyToLocal();
