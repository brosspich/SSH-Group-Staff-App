import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();
const sql = fs.readFileSync(
  "app/backend/prisma/d1_migration/09_sync_all_users_from_supabase.sql",
  "utf8",
);

// Strip line comments
const cleanSql = sql
  .split("\n")
  .map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("--")) return "";
    return line;
  })
  .join("\n");

const statements = cleanSql
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

async function run() {
  console.log("Total statements to execute:", statements.length);
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await prisma.$executeRawUnsafe(stmt);
    } catch (err) {
      console.error(
        "Failed at statement " + i + ":\n" + stmt + "\nError: " + err.message,
      );
      process.exit(1);
    }
  }
  console.log("All statements executed successfully on local dev.db!");

  const userCount = await prisma.user.count();
  const userDetailsCount = await prisma.userDetails.count();
  const sessionCount = await prisma.deviceSession.count();
  const attCount = await prisma.attendanceLog.count();
  const reqCount = await prisma.attendanceRequest.count();
  const legacyCount = await prisma.staffUser.count();

  console.log(`\nCounts in local dev.db:`);
  console.log(`- Users: ${userCount}`);
  console.log(`- UserDetails: ${userDetailsCount}`);
  console.log(`- DeviceSessions: ${sessionCount}`);
  console.log(`- AttendanceLogs: ${attCount}`);
  console.log(`- AttendanceRequests: ${reqCount}`);
  console.log(`- Legacy StaffUsers: ${legacyCount}`);

  const bpakUser = await prisma.user.findUnique({
    where: { systemId: "system-0002-0001" },
    include: {
      details: true,
      deviceSessions: true,
      attendanceLogs: true,
      attendanceRequests: true,
    },
  });
  console.log("\nVerified bpak user (system-0002-0001):", {
    systemId: bpakUser?.systemId,
    id: bpakUser?.id,
    username: bpakUser?.username,
    role: bpakUser?.role,
    name: bpakUser?.details?.name,
    email: bpakUser?.details?.email,
    companyId: bpakUser?.details?.companyId,
    deviceCount: bpakUser?.deviceSessions?.length,
    attCount: bpakUser?.attendanceLogs?.length,
    reqCount: bpakUser?.attendanceRequests?.length,
  });
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
