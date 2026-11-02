const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const sql = fs.readFileSync(
    "D:/Code/SSH-Group-Staff-App/app/backend/prisma/cloudflare_d1_seed.sql",
    "utf8",
  );
  // Split into individual statements
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const statement of statements) {
    if (statement.trim()) {
      await prisma.$executeRawUnsafe(statement);
    }
  }

  const staffCount = await prisma.staffUser.count();
  const qrCount = await prisma.attendanceQr.count();
  console.log(
    `Seeded successfully! Staff users: ${staffCount}, Attendance QR records: ${qrCount}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
