require("dotenv").config({ path: __dirname + "/../.env" });
const { PrismaClient } = require("@prisma/client");
const {
  CloudflareD1Client,
} = require("../dist/infrastructure/database/d1Client.js");

const prisma = new PrismaClient();
const d1 = new CloudflareD1Client();

async function pullSubscriptionFromD1() {
  console.log(
    "⬇️ Starting Subscription Pull: Cloudflare D1 -> Local dev.db...",
  );

  try {
    const d1Rows = await d1.query("SELECT * FROM Subscription");
    console.log(`☁️ Found ${d1Rows.length} records in Cloudflare D1`);

    if (d1Rows.length === 0) {
      console.log("⚠️ No records found in Cloudflare D1.");
      process.exit(0);
    }

    let syncedCount = 0;
    for (const row of d1Rows) {
      const createdAt = row.createdAt ? new Date(row.createdAt) : new Date();

      await prisma.subscription.upsert({
        where: { id: row.id },
        update: {
          systemId: row.system_id || row.systemId,
          plan: row.plan,
          startDate: row.start_date || row.startDate,
          endDate: row.end_date || row.endDate,
          createdAt: createdAt,
        },
        create: {
          id: row.id,
          systemId: row.system_id || row.systemId,
          plan: row.plan,
          startDate: row.start_date || row.startDate,
          endDate: row.end_date || row.endDate,
          createdAt: createdAt,
        },
      });
      syncedCount++;
    }

    console.log(
      `\n✅ Pull Completed: Synced ${syncedCount} records to local dev.db`,
    );
    const localRows = await prisma.subscription.findMany({
      orderBy: { systemId: "asc" },
    });
    console.table(localRows);

    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Pull subscription error:", err);
    process.exit(1);
  }
}

pullSubscriptionFromD1();
