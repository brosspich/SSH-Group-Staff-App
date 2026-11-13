require("dotenv").config({ path: __dirname + "/../.env" });
const { PrismaClient } = require("@prisma/client");
const {
  CloudflareD1Client,
} = require("../dist/infrastructure/database/d1Client.js");

const prisma = new PrismaClient();
const d1 = new CloudflareD1Client();

async function syncUserToLocal() {
  console.log("⬇️ Starting User Pull: Cloudflare D1 -> Local dev.db...");

  try {
    const d1Users = await d1.query("SELECT * FROM User");
    const d1Details = await d1.query("SELECT * FROM UserDetails");
    console.log(
      `☁️ Found ${d1Users.length} Users and ${d1Details.length} UserDetails in Cloudflare D1`,
    );

    let userCount = 0;
    for (const u of d1Users) {
      const createdAt = u.createdAt ? new Date(u.createdAt) : new Date();
      const updatedAt = u.updatedAt ? new Date(u.updatedAt) : new Date();
      const isActive =
        u.isActive === 1 || u.isActive === true || u.isActive === "1";

      await prisma.user.upsert({
        where: { systemId: u.system_id || u.systemId },
        update: {
          id: u.id,
          username: u.username,
          passwordHash: u.passwordHash,
          role: u.role || "staff",
          isActive,
          createdAt,
          updatedAt,
        },
        create: {
          systemId: u.system_id || u.systemId,
          id: u.id,
          username: u.username,
          passwordHash: u.passwordHash,
          role: u.role || "staff",
          isActive,
          createdAt,
          updatedAt,
        },
      });
      userCount++;
    }

    let detailsCount = 0;
    for (const d of d1Details) {
      const dCreatedAt = d.createdAt ? new Date(d.createdAt) : new Date();
      const dUpdatedAt = d.updatedAt ? new Date(d.updatedAt) : new Date();

      await prisma.userDetails.upsert({
        where: { systemId: d.system_id || d.systemId },
        update: {
          companyId: d.company_id || d.companyId,
          name: d.name,
          email: d.email || null,
          phone: d.phone || null,
          position: d.position || null,
          dob: d.dob || null,
          joined: d.joined || null,
          createdAt: dCreatedAt,
          updatedAt: dUpdatedAt,
        },
        create: {
          systemId: d.system_id || d.systemId,
          companyId: d.company_id || d.companyId,
          name: d.name,
          email: d.email || null,
          phone: d.phone || null,
          position: d.position || null,
          dob: d.dob || null,
          joined: d.joined || null,
          createdAt: dCreatedAt,
          updatedAt: dUpdatedAt,
        },
      });
      detailsCount++;
    }

    console.log(`\n✅ Pull Completed:`);
    console.log(`   - Users synced to local dev.db: ${userCount}`);
    console.log(`   - UserDetails synced to local dev.db: ${detailsCount}`);

    const localUsers = await prisma.user.findMany({
      select: {
        systemId: true,
        id: true,
        username: true,
        role: true,
        isActive: true,
      },
      orderBy: { systemId: "asc" },
    });
    console.log(`\n🔍 Local dev.db now has ${localUsers.length} Users:`);
    console.table(localUsers);

    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ User Pull from D1 error:", err);
    process.exit(1);
  }
}

syncUserToLocal();
