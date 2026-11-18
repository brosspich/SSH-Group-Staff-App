const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const {
  CloudflareD1Client,
} = require("../dist/infrastructure/database/d1Client.js");

const d1 = new CloudflareD1Client();

async function checkTodayD1() {
  const records = await d1.query(
    "SELECT id, userId, scanDate, scanTime, type FROM AttendanceLog WHERE scanDate = '2026-11-18' ORDER BY createdAt ASC;",
  );
  console.log("Today D1 records:", records);
}

checkTodayD1().catch(console.error);
