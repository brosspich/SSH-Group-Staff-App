const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const rawSql = fs.readFileSync(
    "D:/Code/SSH-Group-Staff-App/app/backend/prisma/migrate_to_normalized_tables.sql",
    "utf8",
  );
  const cleanSql = rawSql.replace(/--.*$/gm, "");
  const statements = cleanSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (let i = 0; i < statements.length; i++) {
    try {
      await prisma.$executeRawUnsafe(statements[i]);
      console.log(`Statement ${i} passed`);
    } catch (err) {
      console.error(`Statement ${i} failed:`, err.message);
      console.error("SQL start:", statements[i].substring(0, 80));
    }
  }
  const u = await prisma.user.count();
  const g = await prisma.sshGroup.count();
  const m = await prisma.groupMember.count();
  const a = await prisma.auditLog.count();
  console.log(
    `Success! Users: ${u}, SshGroups: ${g}, GroupMembers: ${m}, AuditLogs: ${a}`,
  );
}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
