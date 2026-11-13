require("dotenv").config({ path: __dirname + "/../.env" });
const { PrismaClient } = require("@prisma/client");
const {
  CloudflareD1Client,
} = require("../dist/infrastructure/database/d1Client.js");

const prisma = new PrismaClient();
const d1 = new CloudflareD1Client();

async function syncUserToD1() {
  console.log("🔄 Starting User Sync: Local dev.db -> Cloudflare D1...");

  try {
    const users = await prisma.user.findMany({
      include: { details: true },
    });
    console.log(`📦 Found ${users.length} Users in local dev.db`);

    let userCount = 0;
    let detailsCount = 0;

    for (const u of users) {
      const createdAt = u.createdAt
        ? new Date(u.createdAt).toISOString()
        : new Date().toISOString();
      const updatedAt = u.updatedAt
        ? new Date(u.updatedAt).toISOString()
        : new Date().toISOString();

      await d1.execute(
        `INSERT OR REPLACE INTO User (system_id, id, username, passwordHash, role, isActive, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          u.systemId,
          u.id,
          u.username,
          u.passwordHash,
          u.role,
          u.isActive ? 1 : 0,
          createdAt,
          updatedAt,
        ],
      );
      userCount++;

      if (u.details) {
        const dCreatedAt = u.details.createdAt
          ? new Date(u.details.createdAt).toISOString()
          : new Date().toISOString();
        const dUpdatedAt = u.details.updatedAt
          ? new Date(u.details.updatedAt).toISOString()
          : new Date().toISOString();

        await d1.execute(
          `INSERT OR REPLACE INTO UserDetails (system_id, company_id, name, email, phone, position, dob, joined, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            u.details.systemId,
            u.details.companyId,
            u.details.name,
            u.details.email,
            u.details.phone,
            u.details.position,
            u.details.dob,
            u.details.joined,
            dCreatedAt,
            dUpdatedAt,
          ],
        );
        detailsCount++;
      }
    }

    console.log(`\n✅ Sync Completed:`);
    console.log(`   - Users upserted to D1: ${userCount}`);
    console.log(`   - UserDetails upserted to D1: ${detailsCount}`);

    const d1Users = await d1.query(
      "SELECT system_id, id, username, role, isActive FROM User ORDER BY system_id ASC",
    );
    console.log(`\n🔍 Cloudflare D1 now has ${d1Users.length} Users:`);
    console.table(d1Users);

    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ User Sync to D1 error:", err);
    process.exit(1);
  }
}

syncUserToD1();
