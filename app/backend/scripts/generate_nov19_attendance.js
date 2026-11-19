const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// The 8 records from Supabase on 2026-11-19 provided by user:
const supabaseNov19Records = [
  {
    system_id: "system-0001-0016",
    name: "Ms. NEP Sreypov",
    username: "sreypov",
    attendance_record: {
      id: "ATT-0000-0000-0039",
      date: "2026-11-19",
      name: "Ms. NEP Sreypov",
      time: "8:07:49 AM",
      type: "time-in",
      qr_data: "ssh-group-attendance-01",
      staff_id: "0016",
      system_id: "system-0001-0016",
      timestamp: "2026-11-19T01:07:49.626Z",
    },
  },
  {
    system_id: "system-0001-0017",
    name: "Ms. YOU Kompheak",
    username: "kompheak",
    attendance_record: {
      id: "ATT-0000-0000-0030",
      date: "2026-11-19",
      name: "Ms. YOU Kompheak",
      time: "7:58:50 AM",
      type: "time-in",
      qr_data: "ssh-group-attendance-01",
      staff_id: "0017",
      system_id: "system-0001-0017",
      timestamp: "2026-11-19T00:58:50.300Z",
    },
  },
  {
    system_id: "system-0001-0020",
    name: "Mr. HON Panha",
    username: "panha",
    attendance_record: {
      id: "ATT-0000-0000-0023",
      date: "2026-11-19",
      name: "Mr. HON Panha",
      time: "8:00:45 AM",
      type: "time-in",
      qr_data: "ssh-group-attendance-01",
      staff_id: "0020",
      system_id: "system-0001-0020",
      timestamp: "2026-11-19T01:00:45.833Z",
    },
  },
  {
    system_id: "system-0001-0007",
    name: "Mr. BUN Sokkoeu",
    username: "sokkoeu",
    attendance_record: {
      id: "ATT-0000-0000-0022",
      date: "2026-11-19",
      name: "Mr. BUN Sokkoeu",
      time: "8:09:04 AM",
      type: "time-in",
      qr_data: "ssh-group-attendance-01",
      staff_id: "0007",
      system_id: "system-0001-0007",
      timestamp: "2026-11-19T01:09:04.014Z",
    },
  },
  {
    system_id: "system-0001-0021",
    name: "Mr. EANG Sambath",
    username: "sambath",
    attendance_record: {
      id: "ATT-0000-0000-0017",
      date: "2026-11-19",
      name: "Mr. EANG Sambath",
      time: "7:59:38 AM",
      type: "time-in",
      qr_data: "ssh-group-attendance-01",
      staff_id: "0021",
      system_id: "system-0001-0021",
      timestamp: "2026-11-19T00:59:38.331Z",
    },
  },
  {
    system_id: "system-0001-0015",
    name: "Mr. Sot Haopheng",
    username: "pheng",
    attendance_record: {
      id: "ATT-0000-0000-0018",
      date: "2026-11-19",
      name: "Mr. Sot Haopheng",
      time: "8:16:41 AM",
      type: "time-in",
      qr_data: "ssh-group-attendance-01",
      staff_id: "0015",
      system_id: "system-0001-0015",
      timestamp: "2026-11-19T01:16:41.028Z",
    },
  },
  {
    system_id: "system-0001-0026",
    name: "Ms. SUN Cheara",
    username: "cheara",
    attendance_record: {
      id: "ATT-0000-0000-0026",
      date: "2026-11-19",
      name: "Ms. SUN Cheara",
      time: "8:05:22 AM",
      type: "time-in",
      qr_data: "ssh-group-attendance-01",
      staff_id: "0026",
      system_id: "system-0001-0026",
      timestamp: "2026-11-19T01:05:22.800Z",
    },
  },
  {
    system_id: "system-0001-0019",
    name: "Ms. PHOS Sreynit",
    username: "sreynit",
    attendance_record: {
      id: "ATT-0000-0000-0014",
      date: "2026-11-19",
      name: "Ms. PHOS Sreynit",
      time: "8:09:43 AM",
      type: "time-in",
      qr_data: "ssh-group-attendance-01",
      staff_id: "0019",
      system_id: "system-0001-0019",
      timestamp: "2026-11-19T01:09:43.993Z",
    },
  },
];

// The 3 already inserted into D1 by the user on 2026-11-19:
const alreadyInD1 = [
  {
    id: "system-0001-0025-ATT-0000-0016",
    userId: "system-0001-0025",
    companyId: "system-0001",
    scanDate: "2026-11-19",
    scanTime: "8:06:54 AM",
    type: "TIME_IN",
    qrData: "ssh-group-attendance-01",
    createdAt: "2026-11-19T01:06:54.060Z",
  },
  {
    id: "system-0001-0022-ATT-0000-0025",
    userId: "system-0001-0022",
    companyId: "system-0001",
    scanDate: "2026-11-19",
    scanTime: "8:06:35 AM",
    type: "TIME_IN",
    qrData: "ssh-group-attendance-01",
    createdAt: "2026-11-19T01:06:35.083Z",
  },
  {
    id: "system-0001-0024-ATT-0000-0016",
    userId: "system-0001-0024",
    companyId: "system-0001",
    scanDate: "2026-11-19",
    scanTime: "8:04:05 AM",
    type: "TIME_IN",
    qrData: "ssh-group-attendance-01",
    createdAt: "2026-11-19T01:04:05.989Z",
  },
];

function normalizeTime(t) {
  return t ? t.replace(/[\u202F\u00A0]/g, " ").trim() : "";
}

function normalizeType(type) {
  if (!type) return "TIME_IN";
  const upper = type.toUpperCase().replace("-", "_");
  if (upper.includes("IN")) return "TIME_IN";
  if (upper.includes("OUT")) return "TIME_OUT";
  return "TIME_OTHER";
}

async function main() {
  console.log("=== Calculating sequential IDs for Nov 19 2026 ===");
  const mappedRecords = [];

  for (const item of supabaseNov19Records) {
    const userId = item.system_id;
    const r = item.attendance_record;

    // Count how many records exist for this user in dev.db up to Nov 18
    const count = await prisma.attendanceLog.count({
      where: {
        userId: userId,
        scanDate: { startsWith: "2026-11" },
      },
    });

    const nextSeq = String(count + 1).padStart(4, "0");
    const newId = `${userId}-ATT-0000-${nextSeq}`;
    const cleanTime = normalizeTime(r.time);
    const cleanType = normalizeType(r.type);

    mappedRecords.push({
      id: newId,
      userId: userId,
      companyId: "system-0001",
      scanDate: r.date,
      scanTime: cleanTime,
      type: cleanType,
      qrData: r.qr_data || "ssh-group-attendance-01",
      createdAt: r.timestamp || `${r.date}T00:00:00.000Z`,
      remark: null,
      image: null,
      name: item.name,
      username: item.username,
    });
  }

  console.log("\n--- MAPPED 8 NEW RECORDS ---");
  mappedRecords.forEach(m => {
    console.log(`${m.id} | ${m.username.padEnd(10)} | ${m.scanDate} ${m.scanTime} | ${m.type}`);
  });

  // Generate D1 SQL INSERT statement
  const sqlValues = mappedRecords.map(r => 
    `('${r.id}', '${r.userId}', '${r.companyId}', '${r.scanDate}', '${r.scanTime}', '${r.type}', '${r.qrData}', '${r.createdAt}', NULL, NULL)`
  ).join(",\n");

  const fullSql = `INSERT INTO "AttendanceLog"("id", "userId", "companyId", "scanDate", "scanTime", "type", "qrData", "createdAt", "remark", "image") VALUES\n${sqlValues};`;

  console.log("\n=== CLOUDFLARE D1 SQL INSERT QUERY ===");
  console.log(fullSql);

  // Sync all Nov 19 records (the 8 new + the 3 from D1) to local dev.db
  const all11ToSync = [...alreadyInD1, ...mappedRecords];
  for (const rec of all11ToSync) {
    await prisma.attendanceLog.upsert({
      where: { id: rec.id },
      create: {
        id: rec.id,
        userId: rec.userId,
        companyId: rec.companyId,
        scanDate: rec.scanDate,
        scanTime: rec.scanTime,
        type: rec.type,
        qrData: rec.qrData,
        createdAt: new Date(rec.createdAt),
      },
      update: {
        scanDate: rec.scanDate,
        scanTime: rec.scanTime,
        type: rec.type,
        qrData: rec.qrData,
        createdAt: new Date(rec.createdAt),
      },
    });
  }

  console.log(`\n✅ Local dev.db updated with all 11 records for 2026-11-19.`);
}

main().finally(() => prisma.$disconnect());
