const { PrismaClient } = require("../node_modules/@prisma/client");
const fs = require("fs");

const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.deviceSession.findMany();
  const sqlLines = sessions.map((s) => {
    const esc = (v) =>
      v === null || v === undefined
        ? "NULL"
        : "'" + String(v).replace(/'/g, "''") + "'";
    const lastAct =
      s.lastActive instanceof Date
        ? s.lastActive.toISOString()
        : String(s.lastActive);
    const lastLog =
      s.lastLogin instanceof Date
        ? s.lastLogin.toISOString()
        : String(s.lastLogin);
    return `INSERT OR REPLACE INTO DeviceSession (id, userId, deviceName, modelName, os, osVersion, appVersion, ipAddress, location, isTerminated, lastActive, lastLogin) VALUES (${esc(s.id)}, ${esc(s.userId)}, ${esc(s.deviceName)}, ${esc(s.modelName)}, ${esc(s.os)}, ${esc(s.osVersion)}, ${esc(s.appVersion)}, ${esc(s.ipAddress)}, ${esc(s.location)}, ${s.isTerminated}, ${esc(lastAct)}, ${esc(lastLog)});`;
  });

  fs.writeFileSync(
    "./app/backend/prisma/d1_devicesession_seed.sql",
    sqlLines.join("\n"),
  );
  console.log(
    `Wrote ${sqlLines.length} SQL inserts to ./app/backend/prisma/d1_devicesession_seed.sql`,
  );
}

main().finally(() => prisma.$disconnect());
