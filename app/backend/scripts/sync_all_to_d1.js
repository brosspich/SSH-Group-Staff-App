require("dotenv").config({ path: "./.env" });
const { PrismaClient } = require("@prisma/client");
const { d1Client } = require("../dist/infrastructure/database/d1Client.js");

const prisma = new PrismaClient();

async function run() {
  console.log("🚀 Starting Cloudflare D1 Sync...");

  try {
    // 1. Run Migration 14 on Cloudflare D1 to ensure User table does not have global unique constraint on username
    console.log("Step 1: Applying migration 14 on Cloudflare D1...");
    try {
      await d1Client.execute(`
        CREATE TABLE IF NOT EXISTS User_new (
          system_id TEXT PRIMARY KEY NOT NULL,
          id TEXT NOT NULL,
          username TEXT NOT NULL,
          passwordHash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'member',
          isActive INTEGER NOT NULL DEFAULT 1,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await d1Client.execute(`
        INSERT OR REPLACE INTO User_new (system_id, id, username, passwordHash, role, isActive, createdAt, updatedAt)
        SELECT system_id, id, username, passwordHash, role, isActive, createdAt, updatedAt FROM User;
      `);
      await d1Client.execute(`DROP TABLE User;`);
      await d1Client.execute(`ALTER TABLE User_new RENAME TO User;`);
      await d1Client.execute(`CREATE INDEX IF NOT EXISTS idx_user_id ON User (id);`);
      await d1Client.execute(`CREATE INDEX IF NOT EXISTS idx_user_username ON User (username);`);
      console.log("✅ Cloudflare D1 Migration 14 applied successfully.");
    } catch (migErr) {
      console.log("ℹ️ Migration 14 note:", migErr.message);
    }

    // 2. Fetch all Users and UserDetails from local database
    const users = await prisma.user.findMany({
      include: { details: true },
    });
    console.log(`Step 2: Found ${users.length} users in local DB to sync to Cloudflare D1...`);

    let userSynced = 0;
    let detailsSynced = 0;

    for (const u of users) {
      await d1Client.execute(
        `INSERT OR REPLACE INTO User (system_id, id, username, passwordHash, role, isActive, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          u.systemId,
          u.id,
          u.username,
          u.passwordHash,
          u.role,
          u.isActive ? 1 : 0,
          u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
          u.updatedAt ? new Date(u.updatedAt).toISOString() : new Date().toISOString(),
        ],
      );
      userSynced++;

      if (u.details) {
        await d1Client.execute(
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
            u.details.createdAt ? new Date(u.details.createdAt).toISOString() : new Date().toISOString(),
            u.details.updatedAt ? new Date(u.details.updatedAt).toISOString() : new Date().toISOString(),
          ],
        );
        detailsSynced++;
      }
    }

    console.log(`✅ Synced ${userSynced} Users and ${detailsSynced} UserDetails to Cloudflare D1!`);

    // 3. Query Cloudflare D1 to confirm
    const d1Users = await d1Client.query("SELECT system_id, id, username, role, isActive FROM User;");
    console.log(`\n🎉 Verification: Cloudflare D1 now has ${d1Users.length} Users:`);
    console.table(d1Users);

    process.exit(0);
  } catch (err) {
    console.error("❌ D1 Sync error:", err);
    process.exit(1);
  }
}

run();
