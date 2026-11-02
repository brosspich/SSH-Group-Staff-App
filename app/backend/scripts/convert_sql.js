const fs = require("fs");

const qrPath =
  "C:/Users/itlan/.gemini/antigravity/brain/e31b88d8-d9da-4559-8dc0-11af3467fbc4/.user_uploaded/media_1793612854675_0fc866ae.sql";
const userPath =
  "C:/Users/itlan/.gemini/antigravity/brain/e31b88d8-d9da-4559-8dc0-11af3467fbc4/.user_uploaded/media_1793612856440_1a5f5b0c.sql";

const qrSql = fs.readFileSync(qrPath, "utf8").trim();
const userSql = fs.readFileSync(userPath, "utf8").trim();

// Remove "public." schema qualifiers for SQLite
let cleanQr = qrSql.replace(/public\./g, "");
let cleanUser = userSql.replace(/public\./g, "");

// Convert PostgreSQL boolean literals true/false outside quotes to 1/0
cleanUser = cleanUser
  .replace(/, true\)/g, ", 1)")
  .replace(/, false\)/g, ", 0)");

const finalSql = `-- ========================================================
-- Cloudflare D1 / SQLite Tables & Seed Data
-- ========================================================

-- Table 1: ssh-group-staff-attendance-qr
CREATE TABLE IF NOT EXISTS "ssh-group-staff-attendance-qr" (
    id TEXT PRIMARY KEY,
    "qr-code" TEXT,
    company_name TEXT,
    location TEXT,
    telegram_bot_token TEXT,
    telegram_chat_id TEXT,
    "time-in" TEXT,
    "time-out" TEXT
);

${cleanQr}

-- Table 2: ssh_group_staff_users
CREATE TABLE IF NOT EXISTS ssh_group_staff_users (
    id TEXT PRIMARY KEY,
    name TEXT,
    username TEXT UNIQUE,
    password TEXT,
    email TEXT,
    phone TEXT,
    position TEXT,
    role TEXT,
    devices TEXT,
    joined TEXT,
    attendance TEXT,
    request_attendance_rules TEXT,
    system_id TEXT,
    is_active INTEGER DEFAULT 1
);

${cleanUser}
`;

fs.writeFileSync(
  "D:/Code/SSH-Group-Staff-App/app/backend/prisma/cloudflare_d1_seed.sql",
  finalSql,
);
console.log(
  "Successfully wrote cloudflare_d1_seed.sql! Characters:",
  finalSql.length,
);
