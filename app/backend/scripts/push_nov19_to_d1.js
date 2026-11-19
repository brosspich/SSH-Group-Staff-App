const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const {
  CloudflareD1Client,
} = require("../dist/infrastructure/database/d1Client.js");

const d1 = new CloudflareD1Client();

const sql = `INSERT INTO "AttendanceLog"("id", "userId", "companyId", "scanDate", "scanTime", "type", "qrData", "createdAt", "remark", "image") VALUES
('system-0001-0016-ATT-0000-0027', 'system-0001-0016', 'system-0001', '2026-11-19', '8:07:49 AM', 'TIME_IN', 'ssh-group-attendance-01', '2026-11-19T01:07:49.626Z', NULL, NULL),
('system-0001-0017-ATT-0000-0024', 'system-0001-0017', 'system-0001', '2026-11-19', '7:58:50 AM', 'TIME_IN', 'ssh-group-attendance-01', '2026-11-19T00:58:50.300Z', NULL, NULL),
('system-0001-0020-ATT-0000-0021', 'system-0001-0020', 'system-0001', '2026-11-19', '8:00:45 AM', 'TIME_IN', 'ssh-group-attendance-01', '2026-11-19T01:00:45.833Z', NULL, NULL),
('system-0001-0007-ATT-0000-0016', 'system-0001-0007', 'system-0001', '2026-11-19', '8:09:04 AM', 'TIME_IN', 'ssh-group-attendance-01', '2026-11-19T01:09:04.014Z', NULL, NULL),
('system-0001-0021-ATT-0000-0017', 'system-0001-0021', 'system-0001', '2026-11-19', '7:59:38 AM', 'TIME_IN', 'ssh-group-attendance-01', '2026-11-19T00:59:38.331Z', NULL, NULL),
('system-0001-0015-ATT-0000-0014', 'system-0001-0015', 'system-0001', '2026-11-19', '8:16:41 AM', 'TIME_IN', 'ssh-group-attendance-01', '2026-11-19T01:16:41.028Z', NULL, NULL),
('system-0001-0026-ATT-0000-0025', 'system-0001-0026', 'system-0001', '2026-11-19', '8:05:22 AM', 'TIME_IN', 'ssh-group-attendance-01', '2026-11-19T01:05:22.800Z', NULL, NULL),
('system-0001-0019-ATT-0000-0013', 'system-0001-0019', 'system-0001', '2026-11-19', '8:09:43 AM', 'TIME_IN', 'ssh-group-attendance-01', '2026-11-19T01:09:43.993Z', NULL, NULL);`;

async function run() {
  console.log("Pushing 8 records to Cloudflare D1...");
  const res = await d1.query(sql);
  console.log("✅ D1 Response:", res);
  const check = await d1.query("SELECT id, userId, scanDate, scanTime FROM AttendanceLog WHERE scanDate = '2026-11-19' ORDER BY scanTime ASC;");
  console.log(`📌 Total records for 2026-11-19 in D1: ${check.length}`);
  check.forEach(c => console.log(`   ${c.id} | ${c.userId} | ${c.scanTime}`));
}

run().catch(console.error);
