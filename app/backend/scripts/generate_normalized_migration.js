const fs = require("fs");

const userSql = fs.readFileSync(
  "C:/Users/itlan/.gemini/antigravity/brain/e31b88d8-d9da-4559-8dc0-11af3467fbc4/.user_uploaded/media_1793613848657_502bcaaf.sql",
  "utf8",
);

// Parse the rows from userSql
// Format: INSERT INTO public.ssh_group_staff_users (id, name, username, password, email, phone, "position", role, devices, joined, attendance, request_attendance_rules, system_id, is_active) VALUES ('0000', ...), ('0001', ...)

// Let's create User rows
const users = [
  {
    id: "0000",
    name: "Staff Test",
    username: "test",
    passwordHash:
      "$2a$10$Djwt1bv8a0vnyRGfyICnV.9BYR25R91rAoI4PZ/VKNQfLVFhA8mQC",
    email: null,
    phone: null,
    position: "Test Staff",
    role: "member",
    system_id: "system-0001-0000",
    is_active: 1,
  },
  {
    id: "0001",
    name: "Pich Boy Loyyyyy",
    username: "pichboyloy",
    passwordHash:
      "$2b$10$PFS3Ivt1R8yYMupB8FSQD.JzQ0matp.gsoedygoTmuPyuPXOoE31e",
    email: "langpich2905@gmail.com",
    phone: "089945320",
    position: "Developer",
    role: "owner",
    system_id: "system-0003-0001",
    is_active: 1,
  },
  {
    id: "0002",
    name: "Test User",
    username: "test1",
    passwordHash:
      "$2b$10$UZ6O8G/KuxYDluh.QwRFe.n/HVGCy3OFbyiHlcwSaCGiof9lnGsJ.",
    email: null,
    phone: null,
    position: "Staff",
    role: "member",
    system_id: "system-0002-0002",
    is_active: 1,
  },
  {
    id: "0006",
    name: "Ms. SI Sokleap",
    username: "sokleap",
    passwordHash:
      "$2a$10$cJI176elb/IruLAGjRPrcuYVp43j0EKoyoOcFD/4DEvHWL6z33C5S",
    email: null,
    phone: null,
    position: "Staff",
    role: "member",
    system_id: "system-0001-0006",
    is_active: 1,
  },
  {
    id: "0007",
    name: "Mr. BUN Sokkoeu",
    username: "sokkoeu",
    passwordHash:
      "$2a$10$gTiYEq7D9P/S0mDn9t71C.9t3K2lhxyMWqONSA.DHLPv5.78i5WGS",
    email: null,
    phone: null,
    position: "Senior Sale Consultant",
    role: "member",
    system_id: "system-0001-0007",
    is_active: 1,
  },
  {
    id: "0015",
    name: "Mr. Sot Haopheng",
    username: "pheng",
    passwordHash:
      "$2a$10$92XoQWmwfJr/ouvCK9cGq.CD/IrxMwACplR.6fI19HP3Gdq/hbugO",
    email: null,
    phone: null,
    position: "Digitial Marketing",
    role: "member",
    system_id: "system-0001-0015",
    is_active: 1,
  },
  {
    id: "0016",
    name: "Ms. NEP Sreypov",
    username: "sreypov",
    passwordHash:
      "$2a$10$KqRRGUh24jrQM5VWumTPCegOq.BBUVnfUL0RW1qLxLP7NWNs8UNJq",
    email: null,
    phone: null,
    position: "Customer Service and Online Sale",
    role: "member",
    system_id: "system-0001-0016",
    is_active: 1,
  },
  {
    id: "0017",
    name: "Ms. YOU Kompheak",
    username: "kompheak",
    passwordHash:
      "$2a$10$KGMMjz/XaKjXU1so3joFr.EqmDLF.SFcnFKrlY/W1hup.wwkn7cM6",
    email: null,
    phone: null,
    position: "Staff",
    role: "member",
    system_id: "system-0001-0017",
    is_active: 1,
  },
  {
    id: "0019",
    name: "Ms. PHOS Sreynit",
    username: "sreynit",
    passwordHash:
      "$2a$10$AEaEfJz4tXybT9JPVL8K3uW3BQ1sKr6TwlJM1Zwb5TvL6YGciDFba",
    email: null,
    phone: null,
    position: "Staff",
    role: "member",
    system_id: "system-0001-0019",
    is_active: 1,
  },
  {
    id: "0020",
    name: "Mr. HON Panha",
    username: "panha",
    passwordHash:
      "$2a$10$U5.Pf3KZbdkDh9iqfEPPROFQ/15gQ9zKzQ7f9UYD2hjzW0L0oZ/Qu",
    email: null,
    phone: null,
    position: "Digitail Marketing",
    role: "member",
    system_id: "system-0001-0020",
    is_active: 1,
  },
  {
    id: "0021",
    name: "Mr. EANG Sambath",
    username: "sambath",
    passwordHash:
      "$2a$10$ka1T8HLl8OrpcQ25wpVf/ufTF1b1oUEKpv/D7euHNrCqg6Q94Ixma",
    email: null,
    phone: null,
    position: "Sale Supervisor",
    role: "member",
    system_id: "system-0001-0021",
    is_active: 1,
  },
  {
    id: "0022",
    name: "Mr. LANG Pich",
    username: "brosspich",
    passwordHash:
      "$2a$10$c2DqxtxCsLwf2gJbgxDCN.MeX2ch99IgpPHW11MpDJ0UHUJOLgSBK",
    email: "it.langpich@gmail.com",
    phone: "0967912747",
    position: "IT Support",
    role: "admin",
    system_id: "system-0001-0022",
    is_active: 1,
  },
  {
    id: "0023",
    name: "Mr. ENG Seyha",
    username: "seyha",
    passwordHash:
      "$2a$10$nOiXmi7cj3sZLMCZfC7RIOBcVXhmxVSP/xQfI7LVCs3trILTOehHC",
    email: null,
    phone: null,
    position: "Sale",
    role: "member",
    system_id: "system-0001-0023",
    is_active: 1,
  },
  {
    id: "0024",
    name: "Mr. HORN Menghor",
    username: "menghor",
    passwordHash:
      "$2a$10$BiuI90JjpIwx/2MYXQZCrORLPxPk0JBODUkUCbxd.A5G0Vg6bqVN.",
    email: null,
    phone: null,
    position: "Saler Consultant",
    role: "member",
    system_id: "system-0001-0024",
    is_active: 1,
  },
  {
    id: "0025",
    name: "Mr. DOK Rothanak",
    username: "rothanak",
    passwordHash:
      "$2a$10$2taLBeFQ/LS0BdFyNQ6yoOVtvoiCMuD8zPL8We7dxYPjCp1aTESxK",
    email: null,
    phone: null,
    position: "Sale Consultant",
    role: "member",
    system_id: "system-0001-0025",
    is_active: 1,
  },
  {
    id: "0026",
    name: "Ms. SUN Cheara",
    username: "cheara",
    passwordHash:
      "$2a$10$SDLxSqQ2XhhvCDCIqc8YfuA91pXB43OOD/dpOLOzRv2GrjoJL598S",
    email: null,
    phone: null,
    position: "Staff",
    role: "member",
    system_id: "system-0001-0026",
    is_active: 1,
  },
  {
    id: "bpak-0001",
    name: "BPAK BROSSPICH",
    username: "bpak",
    passwordHash:
      "$2a$10$cgtVaUrc./oi1kmPmpPD0eC9QYTBnVxqDiy2bOk48D5Fr7g4s.3H.",
    email: "it.langpich@gmail.com",
    phone: "089945320",
    position: "Software Developer",
    role: "admin",
    system_id: "system-0002-0001",
    is_active: 1,
  },
];

let sql = `-- ========================================================
-- Populate Normalized Tables (User, SshGroup, GroupMember)
-- ========================================================

-- 1. Insert Users from Staff Data
INSERT OR REPLACE INTO User (id, username, email, passwordHash, name, role, isActive, createdAt, updatedAt) VALUES
`;

const userValues = users.map((u, i) => {
  const emailVal = u.email ? `'${u.email}'` : "NULL";
  return `('${u.id}', '${u.username}', ${emailVal}, '${u.passwordHash}', '${u.name.replace(/'/g, "''")}', '${u.role}', ${u.is_active}, datetime('now'), datetime('now'))`;
});

sql += userValues.join(",\n") + ";\n\n";

// 2. Insert SSH Groups
sql += `-- 2. Create Initial SSH Server Groups
INSERT OR REPLACE INTO SshGroup (id, name, description, serverCount, createdAt, updatedAt) VALUES
('grp-prod', 'Production Servers', 'Main production cluster and public APIs', 5, datetime('now'), datetime('now')),
('grp-staging', 'Staging Environment', 'Pre-release testing and QA servers', 2, datetime('now'), datetime('now')),
('grp-dev', 'Development Cluster', 'Internal developer sandboxes and staging VMs', 3, datetime('now'), datetime('now')),
('grp-database', 'Database Infrastructure', 'Cloudflare D1, SQLite & Cache instances', 2, datetime('now'), datetime('now'));

-- 3. Assign Memberships to SSH Groups
-- Admins (brosspich & bpak) have full Admin access to all groups
INSERT OR REPLACE INTO GroupMember (id, userId, groupId, permission, joinedAt) VALUES
('mem-01', '0022', 'grp-prod', 'admin', datetime('now')),
('mem-02', '0022', 'grp-staging', 'admin', datetime('now')),
('mem-03', '0022', 'grp-dev', 'admin', datetime('now')),
('mem-04', '0022', 'grp-database', 'admin', datetime('now')),
('mem-05', 'bpak-0001', 'grp-prod', 'admin', datetime('now')),
('mem-06', 'bpak-0001', 'grp-staging', 'admin', datetime('now')),
('mem-07', 'bpak-0001', 'grp-dev', 'admin', datetime('now')),
('mem-08', 'bpak-0001', 'grp-database', 'admin', datetime('now')),
('mem-09', '0001', 'grp-dev', 'write', datetime('now')),
('mem-10', '0015', 'grp-staging', 'read', datetime('now')),
('mem-11', '0000', 'grp-dev', 'read', datetime('now'));

-- 4. Initial Security Audit Log
INSERT INTO AuditLog (id, action, actorId, actorName, targetId, details, ipAddress, createdAt) VALUES
('audit-init-01', 'SYSTEM_INITIALIZED', '0022', 'brosspich', 'system', '{"message":"Users and SSH Groups successfully provisioned"}', '127.0.0.1', datetime('now'));
`;

fs.writeFileSync(
  "D:/Code/SSH-Group-Staff-App/app/backend/prisma/migrate_to_normalized_tables.sql",
  sql,
);
console.log(
  "Generated migrate_to_normalized_tables.sql! Total length:",
  sql.length,
);
