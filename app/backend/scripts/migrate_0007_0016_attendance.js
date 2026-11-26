import "dotenv/config";
import { d1Client } from "../dist/infrastructure/database/d1Client.js";
import { DatabaseSync } from "node:sqlite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "../prisma/dev.db");
const localDb = new DatabaseSync(dbPath);

const raw0007Attendance = [
  {"id": "ATT-0000-0000-0024", "date": "2026-11-26", "name": "Mr. BUN Sokkoeu", "time": "8:12:11 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0007", "system_id": "system-0001-0007", "timestamp": "2026-11-26T01:12:11.060Z"},
  {"id": "ATT-0000-0000-0023", "date": "2026-11-20", "name": "Mr. BUN Sokkoeu", "time": "8:10:11 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0007", "system_id": "system-0001-0007", "timestamp": "2026-11-20T01:10:11.728Z"},
  {"id": "ATT-0000-0000-0022", "date": "2026-11-19", "name": "Mr. BUN Sokkoeu", "time": "8:09:04 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0007", "system_id": "system-0001-0007", "timestamp": "2026-11-19T01:09:04.014Z"},
  {"id": "ATT-0000-0000-0021", "date": "2026-11-18", "name": "Mr. BUN Sokkoeu", "time": "8:09:43 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0007", "system_id": "system-0001-0007", "timestamp": "2026-11-18T01:09:43.756Z"},
  {"id": "ATT-0000-0000-0020", "date": "2026-11-17", "name": "Mr. BUN Sokkoeu", "time": "8:08:53 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0007", "system_id": "system-0001-0007", "timestamp": "2026-11-17T01:08:53.540Z"},
  {"id": "ATT-0000-0000-0019", "date": "2026-11-16", "name": "Mr. BUN Sokkoeu", "time": "8:11:29 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0007", "system_id": "system-0001-0007", "timestamp": "2026-11-16T01:11:29.144Z"},
  {"id": "ATT-0000-0000-0018", "date": "2026-11-13", "name": "Mr. BUN Sokkoeu", "time": "8:11:33 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0007", "system_id": "system-0001-0007", "timestamp": "2026-11-13T01:11:33.221Z"},
  {"id": "ATT-0000-0000-0017", "date": "2026-11-12", "name": "Mr. BUN Sokkoeu", "time": "8:08:24 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0007", "system_id": "system-0001-0007", "timestamp": "2026-11-12T01:08:24.457Z"},
  {"id": "ATT-0000-0000-0016", "date": "2026-11-11", "name": "Mr. BUN Sokkoeu", "time": "8:08:14 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0007", "system_id": "system-0001-0007", "timestamp": "2026-11-11T01:08:14.975Z"},
  {"id": "ATT-0000-0000-0015", "date": "2026-11-10", "name": "Mr. BUN Sokkoeu", "time": "5:01:32 PM", "type": "time-out", "qr_data": "ssh-group-attendance-01", "staff_id": "0007", "system_id": "system-0001-0007", "timestamp": "2026-11-10T10:01:32.883Z"},
  {"id": "ATT-0000-0000-0014", "date": "2026-11-10", "name": "Mr. BUN Sokkoeu", "time": "8:10:25 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0007", "system_id": "system-0001-0007", "timestamp": "2026-11-10T01:10:25.028Z"},
  {"id": "att-0000-0000-0013", "date": "2026-11-07", "name": "Mr. BUN Sokkoeu", "time": "8:07:44 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0007", "timestamp": "2026-11-07T01:07:44.172Z"},
  {"id": "att-0000-0000-0012", "date": "2026-11-06", "name": "Mr. BUN Sokkoeu", "time": "5:02:34 PM", "type": "time-out", "qr_data": "ssh-group-attendance-01", "staff_id": "0007", "timestamp": "2026-11-06T10:02:34.777Z"},
  {"id": "att-0000-0000-0011", "date": "2026-11-06", "name": "Mr. BUN Sokkoeu", "time": "8:09:47 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0007", "timestamp": "2026-11-06T01:09:47.760Z"},
  {"id": "att-0000-0000-0010", "date": "2026-11-05", "name": "Mr. BUN Sokkoeu", "time": "5:10:38 PM", "type": "time-out", "qr_data": "ssh-group-attendance-01", "staff_id": "0007", "timestamp": "2026-11-05T10:10:38.160Z"},
  {"id": "att-0000-0000-0009", "date": "2026-11-05", "name": "Mr. BUN Sokkoeu", "time": "8:07:15 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0007", "timestamp": "2026-11-05T01:07:15.947Z"},
  {"id": "att-0000-0000-0008", "date": "2026-11-04", "name": "Mr. BUN Sokkoeu", "time": "8:08:08 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0007", "timestamp": "2026-11-04T01:08:08.230Z"},
  {"id": "att-0000-0000-0007", "date": "2026-11-03", "name": "Mr. BUN Sokkoeu", "time": "8:06:29 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0007", "timestamp": "2026-11-03T01:06:29.780Z"},
  {"id": "att-0000-0000-0006", "date": "2026-10-28", "name": "Mr. BUN Sokkoeu", "time": "5:03:39 PM", "type": "time-out", "qr_data": "ssh-group-attendance-01", "staff_id": "0007", "timestamp": "2026-10-28T10:03:39.818Z"},
  {"id": "att-0000-0000-0005", "date": "2026-10-28", "name": "Mr. BUN Sokkoeu", "time": "8:08:12 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0007", "timestamp": "2026-10-28T01:08:12.548Z"},
  {"id": "att-0000-0000-0004", "date": "2026-10-27", "name": "Mr. BUN Sokkoeu", "time": "8:03:42 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0007", "timestamp": "2026-10-27T01:03:42.614Z"},
  {"id": "att-0000-0000-0003", "date": "2026-10-26", "name": "Mr. NUM Sokkoeu", "time": "8:04:36 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0007", "timestamp": "2026-10-26T01:04:36.779Z"},
  {"id": "att-0000-0000-0002", "date": "2026-08-22", "name": "Mr. NUM Sokkoeu", "time": "8:10:42 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0007", "timestamp": "2026-08-22T01:10:42.366Z"},
  {"id": "att-0000-0000-0001", "date": "2026-08-21", "name": "Mr. NUM Sokkoeu", "time": "8:17:31 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0007", "timestamp": "2026-08-21T01:17:31.795Z"}
];

const raw0016Attendance = [
  {"id": "ATT-0000-0000-0045", "date": "2026-11-26", "name": "Ms. NEP Sreypov", "time": "8:08:20 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-26T01:08:20.903Z"},
  {"id": "ATT-0000-0000-0044", "date": "2026-11-21", "name": "Ms. NEP Sreypov", "time": "5:08:28 PM", "type": "time-out", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-21T10:08:28.058Z"},
  {"id": "ATT-0000-0000-0043", "date": "2026-11-21", "name": "Ms. NEP Sreypov", "time": "8:07:33 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-21T01:07:33.709Z"},
  {"id": "ATT-0000-0000-0042", "date": "2026-11-20", "name": "Ms. NEP Sreypov", "time": "5:06:18 PM", "type": "time-out", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-20T10:06:18.324Z"},
  {"id": "ATT-0000-0000-0041", "date": "2026-11-20", "name": "Ms. NEP Sreypov", "time": "8:08:52 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-20T01:08:52.580Z"},
  {"id": "ATT-0000-0000-0040", "date": "2026-11-19", "name": "Ms. NEP Sreypov", "time": "5:05:26 PM", "type": "time-out", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-19T10:05:26.009Z"},
  {"id": "ATT-0000-0000-0039", "date": "2026-11-19", "name": "Ms. NEP Sreypov", "time": "8:07:49 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-19T01:07:49.626Z"},
  {"id": "ATT-0000-0000-0038", "date": "2026-11-18", "name": "Ms. NEP Sreypov", "time": "5:07:14 PM", "type": "time-out", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-18T10:07:14.875Z"},
  {"id": "ATT-0000-0000-0037", "date": "2026-11-18", "name": "Ms. NEP Sreypov", "time": "8:09:29 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-18T01:09:29.334Z"},
  {"id": "ATT-0000-0000-0036", "date": "2026-11-17", "name": "Ms. NEP Sreypov", "time": "5:05:45 PM", "type": "time-out", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-17T10:05:45.582Z"},
  {"id": "ATT-0000-0000-0035", "date": "2026-11-17", "name": "Ms. NEP Sreypov", "time": "8:04:37 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-17T01:04:37.060Z"},
  {"id": "ATT-0000-0000-0034", "date": "2026-11-16", "name": "Ms. NEP Sreypov", "time": "5:05:36 PM", "type": "time-out", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-16T10:05:36.357Z"},
  {"id": "ATT-0000-0000-0033", "date": "2026-11-16", "name": "Ms. NEP Sreypov", "time": "8:03:09 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-16T01:03:09.487Z"},
  {"id": "ATT-0000-0000-0032", "date": "2026-11-14", "name": "Ms. NEP Sreypov", "time": "5:08:40 PM", "type": "time-out", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-14T10:08:40.175Z"},
  {"id": "ATT-0000-0000-0031", "date": "2026-11-14", "name": "Ms. NEP Sreypov", "time": "8:05:40 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-14T01:05:40.774Z"},
  {"id": "ATT-0000-0000-0030", "date": "2026-11-13", "name": "Ms. NEP Sreypov", "time": "5:07:19 PM", "type": "time-out", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-13T10:07:19.546Z"},
  {"id": "ATT-0000-0000-0029", "date": "2026-11-13", "name": "Ms. NEP Sreypov", "time": "8:05:56 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-13T01:05:56.000Z"},
  {"id": "ATT-0000-0000-0028", "date": "2026-11-12", "name": "Ms. NEP Sreypov", "time": "5:06:15 PM", "type": "time-out", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-12T10:06:15.043Z"},
  {"id": "ATT-0000-0000-0027", "date": "2026-11-12", "name": "Ms. NEP Sreypov", "time": "8:09:20 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-12T01:09:20.882Z"},
  {"id": "ATT-0000-0000-0026", "date": "2026-11-11", "name": "Ms. NEP Sreypov", "time": "5:08:23 PM", "type": "time-out", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-11T10:08:23.609Z"},
  {"id": "ATT-0000-0000-0025", "date": "2026-11-11", "name": "Ms. NEP Sreypov", "time": "8:06:01 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-11T01:06:01.432Z"},
  {"id": "ATT-0000-0000-0024", "date": "2026-11-10", "name": "Ms. NEP Sreypov", "time": "5:08:49 PM", "type": "time-out", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-10T10:08:49.200Z"},
  {"id": "ATT-0000-0000-0023", "date": "2026-11-10", "name": "Ms. NEP Sreypov", "time": "8:07:33 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-10T01:07:33.940Z"},
  {"id": "ATT-0000-0000-0022", "date": "2026-11-07", "name": "Ms. NEP Sreypov", "time": "5:07:58 PM", "type": "time-out", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-07T10:07:58.206Z"},
  {"id": "ATT-0000-0000-0021", "date": "2026-11-07", "name": "Ms. NEP Sreypov", "time": "8:01:03 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-07T01:01:03.923Z"},
  {"id": "ATT-0000-0000-0020", "date": "2026-11-06", "name": "Ms. NEP Sreypov", "time": "5:07:49 PM", "type": "time-out", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-06T10:07:49.215Z"},
  {"id": "ATT-0000-0000-0019", "date": "2026-11-06", "name": "Ms. NEP Sreypov", "time": "8:05:33 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-06T01:05:33.773Z"},
  {"id": "ATT-0000-0000-0018", "date": "2026-11-05", "name": "Ms. NEP Sreypov", "time": "5:09:34 PM", "type": "time-out", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-05T10:09:34.906Z"},
  {"id": "ATT-0000-0000-0017", "date": "2026-11-05", "name": "Ms. NEP Sreypov", "time": "8:09:19 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-05T01:09:19.265Z"},
  {"id": "ATT-0000-0000-0016", "date": "2026-11-04", "name": "Ms. NEP Sreypov", "time": "5:06:19 PM", "type": "time-out", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-04T10:06:19.921Z"},
  {"id": "ATT-0000-0000-0015", "date": "2026-11-04", "name": "Ms. NEP Sreypov", "time": "8:03:53 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-04T01:03:53.786Z"},
  {"id": "ATT-0000-0000-0014", "date": "2026-11-03", "name": "Ms. NEP Sreypov", "time": "5:12:48 PM", "type": "time-out", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-03T10:12:48.327Z"},
  {"id": "ATT-0000-0000-0013", "date": "2026-11-03", "name": "Ms. NEP Sreypov", "time": "8:02:20 AM", "type": "time-in", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-03T01:02:20.820Z"},
  {"id": "ATT-0000-0000-0012", "date": "2026-11-02", "name": "Ms. NEP Sreypov", "time": "5:10:37 PM", "type": "time-out", "qr_data": "ssh-group-attendance-01", "staff_id": "0016", "system_id": "system-0001-0016", "timestamp": "2026-11-02T10:10:37.465Z"}
];

function normalizeTime(t) {
  return t ? t.replace(/[\u202F\u00A0]/g, ' ').trim() : "";
}

function normalizeType(type) {
  if (!type) return "TIME_IN";
  const upper = type.toUpperCase().replace("-", "_");
  if (upper.includes("IN")) return "TIME_IN";
  if (upper.includes("OUT")) return "TIME_OUT";
  return "TIME_OTHER";
}

function parseTimeToSeconds(timeStr) {
  const clean = normalizeTime(timeStr);
  const match = clean.match(/^(\d+):(\d+)(?::(\d+))?\s*(AM|PM)?$/i);
  if (!match) return 0;
  let [_, h, m, s, meridian] = match;
  let hours = parseInt(h, 10);
  const mins = parseInt(m, 10);
  const secs = parseInt(s || "0", 10);
  if (meridian) {
    meridian = meridian.toUpperCase();
    if (meridian === "PM" && hours < 12) hours += 12;
    if (meridian === "AM" && hours === 12) hours = 0;
  }
  return hours * 3600 + mins * 60 + secs;
}

function processUserRecords(rawList, userId) {
  // 1. Filter for November 2026
  const novRecords = rawList.filter(r => r.date.startsWith("2026-11"));

  // 2. Map and normalize
  const mapped = novRecords.map(r => ({
    userId: userId,
    companyId: "system-0001",
    scanDate: r.date,
    scanTime: normalizeTime(r.time),
    type: normalizeType(r.type),
    qrData: r.qr_data || "ssh-group-attendance-01",
    createdAt: r.timestamp || new Date(`${r.date}T00:00:00Z`).toISOString(),
    remark: null,
    image: null
  }));

  // 3. Deduplicate (by date + time + type)
  const uniqueMap = new Map();
  for (const item of mapped) {
    const key = `${item.scanDate}_${item.scanTime}_${item.type}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  }

  const list = Array.from(uniqueMap.values());

  // 4. Sort chronologically ascending
  list.sort((a, b) => {
    if (a.scanDate !== b.scanDate) {
      return a.scanDate.localeCompare(b.scanDate);
    }
    return parseTimeToSeconds(a.scanTime) - parseTimeToSeconds(b.scanTime);
  });

  // 5. Assign sequential IDs: system-0001-XXXX-ATT-0000-YYYY
  list.forEach((r, idx) => {
    const seq = String(idx + 1).padStart(4, "0");
    r.id = `${userId}-ATT-0000-${seq}`;
  });

  return list;
}

async function main() {
  console.log("=== PROCESSING 0007 AND 0016 ATTENDANCE ===");

  const list0007 = processUserRecords(raw0007Attendance, "system-0001-0007");
  const list0016 = processUserRecords(raw0016Attendance, "system-0001-0016");

  console.log(`\n📌 User 0007 (BUN Sokkoeu): ${list0007.length} records`);
  list0007.forEach(r => console.log(`  ${r.id} | ${r.scanDate} ${r.scanTime.padEnd(12)} | ${r.type}`));

  console.log(`\n📌 User 0016 (NEP Sreypov): ${list0016.length} records`);
  list0016.forEach(r => console.log(`  ${r.id} | ${r.scanDate} ${r.scanTime.padEnd(12)} | ${r.type}`));

  const allRecords = [...list0007, ...list0016];

  // 1. Update Cloudflare D1
  console.log("\n--- Syncing to Cloudflare D1 ---");
  console.log("Deleting old November records for 0007 and 0016 in D1...");
  await d1Client.execute(
    "DELETE FROM AttendanceLog WHERE userId IN ('system-0001-0007', 'system-0001-0016') AND scanDate LIKE '2026-11%';"
  );
  console.log("Deleted old records from D1.");

  console.log(`Inserting ${allRecords.length} records to Cloudflare D1...`);
  for (const r of allRecords) {
    await d1Client.execute(
      `INSERT INTO AttendanceLog (id, userId, companyId, scanDate, scanTime, type, qrData, createdAt, image, remark)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.userId, r.companyId, r.scanDate, r.scanTime, r.type, r.qrData, r.createdAt, r.image, r.remark]
    );
  }
  console.log("✅ Successfully inserted all records to Cloudflare D1!");

  // 2. Update Local SQLite (dev.db)
  console.log("\n--- Syncing to Local SQLite dev.db ---");
  localDb.exec("DELETE FROM AttendanceLog WHERE userId IN ('system-0001-0007', 'system-0001-0016') AND scanDate LIKE '2026-11%';");
  
  const insertStmt = localDb.prepare(`
    INSERT INTO AttendanceLog (id, userId, companyId, scanDate, scanTime, type, qrData, createdAt, image, remark)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const r of allRecords) {
    insertStmt.run(r.id, r.userId, r.companyId, r.scanDate, r.scanTime, r.type, r.qrData, r.createdAt, r.image, r.remark);
  }
  console.log("✅ Successfully inserted all records to local dev.db!");

  // 3. Verify counts
  const d1Count07 = await d1Client.query("SELECT COUNT(*) as count FROM AttendanceLog WHERE userId = 'system-0001-0007'");
  const d1Count16 = await d1Client.query("SELECT COUNT(*) as count FROM AttendanceLog WHERE userId = 'system-0001-0016'");
  console.log("\n--- Verification in D1 ---");
  console.log("D1 0007 count:", d1Count07[0].count);
  console.log("D1 0016 count:", d1Count16[0].count);

  const localCount07 = localDb.prepare("SELECT COUNT(*) as count FROM AttendanceLog WHERE userId = 'system-0001-0007'").all();
  const localCount16 = localDb.prepare("SELECT COUNT(*) as count FROM AttendanceLog WHERE userId = 'system-0001-0016'").all();
  console.log("\n--- Verification in Local dev.db ---");
  console.log("Local 0007 count:", localCount07[0].count);
  console.log("Local 0016 count:", localCount16[0].count);
}

main().catch(console.error);
