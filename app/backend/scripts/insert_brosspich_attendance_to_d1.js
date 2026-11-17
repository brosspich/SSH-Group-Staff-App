require("dotenv").config({ path: "app/backend/.env" });
const {
  CloudflareD1Client,
} = require("../dist/infrastructure/database/d1Client.js");

const d1 = new CloudflareD1Client();

async function insertRecord() {
  const sql = `INSERT OR REPLACE INTO AttendanceLog (id, userId, companyId, scanDate, scanTime, type, qrData, createdAt, image, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

  await d1.execute(sql, [
    "system-0001-0022-ATT-0000-0020",
    "system-0001-0022",
    "system-0001",
    "2026-11-17",
    "8:06:45 AM",
    "TIME_IN",
    "ssh-group-attendance-01",
    "2026-11-17T01:06:45.000Z",
    null,
    null,
  ]);

  console.log("✅ Successfully inserted system-0001-0022-ATT-0000-0020 to Cloudflare D1!");

  const count = await d1.query(
    "SELECT COUNT(*) as count FROM AttendanceLog WHERE userId = 'system-0001-0022';",
  );
  console.log(`🎉 Total records for brosspich in Cloudflare D1: ${count[0]?.count}`);
}

insertRecord().catch(console.error);
