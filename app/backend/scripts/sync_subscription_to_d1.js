require("dotenv").config({ path: __dirname + "/../.env" });
const { PrismaClient } = require("@prisma/client");
const {
  CloudflareD1Client,
} = require("../dist/infrastructure/database/d1Client.js");

const prisma = new PrismaClient();
const d1 = new CloudflareD1Client();

async function syncSubscription() {
  console.log(
    "🔄 Starting Subscription Sync: Local dev.db -> Cloudflare D1...",
  );

  try {
    // 1. Fetch local records
    const localRows = await prisma.$queryRawUnsafe(
      "SELECT * FROM Subscription",
    );
    console.log(`📦 Found ${localRows.length} records in local dev.db`);

    // 2. Fetch D1 records
    const d1Rows = await d1.query("SELECT * FROM Subscription");
    console.log(`☁️ Found ${d1Rows.length} records currently in Cloudflare D1`);

    const localIds = new Set(localRows.map((r) => r.id));
    const d1Ids = new Set(d1Rows.map((r) => r.id));

    // 3. Delete from D1 if removed from local
    let deletedCount = 0;
    for (const d1Row of d1Rows) {
      if (!localIds.has(d1Row.id)) {
        console.log(`🗑️ Deleting from D1: ${d1Row.id} (${d1Row.system_id})`);
        await d1.execute("DELETE FROM Subscription WHERE id = ?", [d1Row.id]);
        deletedCount++;
      }
    }

    // 4. Insert or Replace local records into D1
    let upsertedCount = 0;
    for (const localRow of localRows) {
      const createdAt = localRow.createdAt
        ? new Date(localRow.createdAt).toISOString()
        : new Date().toISOString();

      await d1.execute(
        `INSERT OR REPLACE INTO Subscription (id, system_id, plan, start_date, end_date, createdAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          localRow.id,
          localRow.system_id,
          localRow.plan,
          localRow.start_date,
          localRow.end_date,
          createdAt,
        ],
      );
      upsertedCount++;
    }

    console.log(`\n✅ Sync Completed:`);
    console.log(`   - Upserted / Updated: ${upsertedCount}`);
    console.log(`   - Deleted from D1: ${deletedCount}`);

    // Verification
    const freshD1 = await d1.query(
      "SELECT id, system_id, plan, start_date, end_date FROM Subscription",
    );
    console.log(
      `\n🔍 Cloudflare D1 now has ${freshD1.length} Subscription records:`,
    );
    console.table(freshD1);

    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Subscription sync error:", err);
    process.exit(1);
  }
}

syncSubscription();
