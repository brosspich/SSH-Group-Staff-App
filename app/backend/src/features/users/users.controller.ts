import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { d1Client } from "../../infrastructure/database/d1Client.js";
import { prisma } from "../../infrastructure/database/prisma.js";

function parseJsonSafe(val: any): any {
  if (!val) return val;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
}

export function formatUserForResponse(user: any) {
  if (!user) return user;

  const details = user.details || {};
  const company = details.company || user.company || null;
  const companyId =
    details.companyId || user.companyId || (company ? company.id : null);
  const staffId = user.id;
  const systemId =
    user.systemId ||
    user.system_id ||
    (companyId ? `${companyId}-${staffId}` : staffId);

  const name = details.name || user.name || "";
  const email = details.email || user.email || null;
  const phone = details.phone || user.phone || null;
  const position = details.position || user.position || null;
  const dob = details.dob || null;
  const joined = details.joined || null;

  // Format device sessions into devices array with full snake_case and camelCase compatibility
  const devices = (user.deviceSessions || []).map((d: any) => ({
    id: d.id,
    deviceName: d.deviceName || d.modelName || "Device",
    device_name: d.deviceName || d.modelName || "Device",
    modelName: d.modelName || d.deviceName || "",
    model_name: d.modelName || d.deviceName || "",
    device_type:
      d.os === "Web" || d.os === "web"
        ? "web"
        : (d.deviceName || "").toLowerCase().includes("tablet")
          ? "tablet"
          : "phone",
    deviceType:
      d.os === "Web" || d.os === "web"
        ? "web"
        : (d.deviceName || "").toLowerCase().includes("tablet")
          ? "tablet"
          : "phone",
    os: d.os || "Android",
    osVersion: d.osVersion || "",
    os_version: d.osVersion || "",
    appVersion: d.appVersion || "1.0.1.10311",
    app_version: d.appVersion || "1.0.1.10311",
    ip: d.ipAddress || "",
    ipAddress: d.ipAddress || "",
    ip_address: d.ipAddress || "",
    location:
      typeof d.location === "string"
        ? d.location
        : parseJsonSafe(d.location) || "Phnom Penh, Cambodia",
    isTerminated: d.isTerminated === 1 ? "true" : "false",
    terminate: d.isTerminated === 1 ? "true" : "false",
    lastActive:
      d.lastActive instanceof Date ? d.lastActive.toISOString() : d.lastActive,
    last_active:
      d.lastActive instanceof Date ? d.lastActive.toISOString() : d.lastActive,
    lastLogin:
      d.lastLogin instanceof Date ? d.lastLogin.toISOString() : d.lastLogin,
    last_login:
      d.lastLogin instanceof Date ? d.lastLogin.toISOString() : d.lastLogin,
  }));

  // Format attendance logs into attendance array with full backward-compatibility
  const attendance = (user.attendanceLogs || []).map((a: any) => {
    const rawType = String(a.type || "time-in");
    const normalizedType = rawType.toLowerCase().replace(/_/g, "-");
    return {
      id: a.id,
      staff_id: staffId,
      staffId: staffId,
      userId: systemId,
      name: name,
      system_id: a.companyId || companyId || null,
      systemId: a.companyId || companyId || null,
      companyId: a.companyId || companyId || null,
      date: a.scanDate,
      scanDate: a.scanDate,
      time: a.scanTime,
      scanTime: a.scanTime,
      type: normalizedType,
      rawType: a.type,
      qr_data: a.qrData,
      qrData: a.qrData,
      remark: a.remark,
      image: a.image,
      timestamp:
        a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
      createdAt:
        a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
    };
  });

  // Ensure attendance array is sorted from newest to oldest
  attendance.sort((a: any, b: any) => {
    const tA = new Date(a.createdAt || a.timestamp || 0).getTime();
    const tB = new Date(b.createdAt || b.timestamp || 0).getTime();
    return tB - tA;
  });

  // Format attendance requests into requestAttendanceRules array with full backward-compatibility
  const requestAttendanceRules = (user.attendanceRequests || []).map(
    (r: any) => ({
      id: r.id,
      staff_id: staffId,
      staffId: staffId,
      userId: systemId,
      name: name,
      position: position,
      subject: r.subject,
      remark: r.remark,
      status: r.status,
      date:
        r.fromDate ||
        (r.createdAt instanceof Date
          ? r.createdAt.toISOString().split("T")[0]
          : r.createdAt
            ? String(r.createdAt).split("T")[0]
            : ""),
      time: r.fromTime || "",
      fromDate: r.fromDate,
      from_date: r.fromDate,
      fromTime: r.fromTime,
      from_time: r.fromTime,
      toDate: r.toDate,
      to_date: r.toDate,
      toTime: r.toTime,
      to_time: r.toTime,
      createdAt:
        r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      created_at:
        r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
    }),
  );

  return {
    id: staffId,
    staff_id: staffId,
    system_id: systemId,
    systemId: systemId,
    username: user.username,
    email: email,
    name: name,
    phone: phone,
    position: position,
    dob: dob,
    joined: joined,
    role: user.role,
    isActive: user.isActive,
    is_active: user.isActive,
    companyId: companyId,
    company_id: companyId,
    company: company,
    details: {
      system_id: systemId,
      systemId: systemId,
      company_id: companyId,
      companyId: companyId,
      name: name,
      email: email,
      phone: phone,
      position: position,
      dob: dob,
      joined: joined,
      createdAt: details.createdAt || user.createdAt,
      updatedAt: details.updatedAt || user.updatedAt,
    },
    devices: devices,
    deviceSessions: devices,
    attendance: attendance,
    attendanceLogs: attendance,
    requestAttendanceRules: requestAttendanceRules,
    request_attendance_rules: requestAttendanceRules,
    attendanceRequests: requestAttendanceRules,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export class UsersController {
  async getUsers(req: Request, res: Response) {
    try {
      const { id, username, email, systemId, companyId, search } = req.query;

      const whereUser: any = {};
      const whereDetails: any = {};

      if (search) {
        whereUser.OR = [
          { username: { contains: String(search) } },
          { id: { contains: String(search) } },
          { systemId: { contains: String(search) } },
          { details: { name: { contains: String(search) } } },
          { details: { email: { contains: String(search) } } },
        ];
      } else {
        if (id) {
          whereUser.OR = [{ id: String(id) }, { systemId: String(id) }];
        }
        if (username) whereUser.username = String(username);
        if (email) whereDetails.email = String(email);
        const compId = companyId || systemId;
        if (compId) whereDetails.companyId = String(compId);
      }

      if (Object.keys(whereDetails).length > 0) {
        whereUser.details = whereDetails;
      }

      const users = await prisma.user.findMany({
        where: Object.keys(whereUser).length > 0 ? whereUser : undefined,
        include: {
          details: { include: { company: true } },
          deviceSessions: true,
          attendanceLogs: { orderBy: { createdAt: "desc" } },
          attendanceRequests: true,
        },
        orderBy: [{ id: "asc" }],
      });

      return res.status(200).json({
        success: true,
        data: users.map(formatUserForResponse),
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || "Failed to fetch users" },
      });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ systemId: String(id) }, { id: String(id) }],
        },
        include: {
          details: { include: { company: true } },
          deviceSessions: true,
          attendanceLogs: { orderBy: { createdAt: "desc" } },
          attendanceRequests: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: "User not found" },
        });
      }

      // Fetch fresh live attendance logs directly from Cloudflare D1
      try {
        const d1Logs = await d1Client.query(
          "SELECT * FROM AttendanceLog WHERE userId = ? OR userId = ? ORDER BY createdAt DESC LIMIT 50;",
          [user.systemId, user.id],
        );
        if (d1Logs && d1Logs.length > 0) {
          (user as any).attendanceLogs = d1Logs;
        }
      } catch (d1Err: any) {
        console.warn(
          "[Cloudflare D1] Could not fetch live attendance logs in getUserById:",
          d1Err?.message,
        );
      }

      return res.status(200).json({
        success: true,
        data: formatUserForResponse(user),
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || "Failed to fetch user" },
      });
    }
  }

  async getNextSystemId(req: Request, res: Response) {
    try {
      const rawSystem = String(req.query.system || "system-0001")
        .trim()
        .toLowerCase();
      const match = rawSystem.match(/^(system-\d+)/i);
      const prefix = match ? match[1].toLowerCase() : "system-0001";

      const users = await prisma.user.findMany({
        select: {
          systemId: true,
          id: true,
          details: { select: { companyId: true } },
        },
      });

      let maxSuffix = 0;
      const targetPrefix = `${prefix}-`;

      for (const u of users) {
        const sysId = String(u.systemId || "").toLowerCase();
        if (sysId.startsWith(targetPrefix)) {
          const numMatch = sysId.slice(targetPrefix.length).match(/^(\d+)/);
          if (numMatch) {
            const num = parseInt(numMatch[1], 10);
            if (!isNaN(num) && num > maxSuffix) maxSuffix = num;
          }
        }
      }

      const nextNum = maxSuffix + 1;
      const formatted = String(nextNum).padStart(4, "0");
      const nextSystemId = `${prefix}-${formatted}`;

      return res.status(200).json({
        success: true,
        data: { nextSystemId },
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || "Failed to generate system ID" },
      });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const payload: any = { ...req.body };

      const cleanUsername = String(payload.username || "")
        .trim()
        .toLowerCase();
      if (!cleanUsername) {
        return res.status(400).json({
          success: false,
          error: { message: "Username is required." },
        });
      }

      // Backend Condition: Username must be unique
      const existingUser = await prisma.user.findUnique({
        where: { username: cleanUsername },
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: {
            message: "This username is already taken. Please choose another.",
          },
        });
      }

      const companyId =
        payload.companyId ||
        payload.company_id ||
        payload.systemId ||
        payload.system_id ||
        "system-0001";

      const cleanId = payload.id
        ? String(payload.id).trim()
        : String(Date.now()).slice(-4);
      const systemId =
        payload.system_id || payload.systemId || `${companyId}-${cleanId}`;

      // Check systemId uniqueness
      const existingSys = await prisma.user.findUnique({
        where: { systemId },
      });
      if (existingSys) {
        return res.status(400).json({
          success: false,
          error: {
            message: `User with System ID "${systemId}" already exists.`,
          },
        });
      }

      // Backend Security: Password hashing
      let finalHash = "$2a$10$defaultHashPlaceholder";
      if (payload.passwordHash) {
        finalHash = payload.passwordHash;
      } else if (payload.password) {
        const rawPass = String(payload.password).trim();
        if (rawPass.startsWith("$2a$") || rawPass.startsWith("$2b$")) {
          finalHash = rawPass;
        } else {
          finalHash = bcrypt.hashSync(rawPass, 10);
        }
      }

      const isActive =
        payload.isActive !== undefined
          ? Boolean(payload.isActive)
          : payload.is_active !== undefined
            ? Boolean(payload.is_active)
            : true;

      const created = await prisma.user.create({
        data: {
          systemId,
          id: cleanId,
          username: cleanUsername,
          passwordHash: finalHash,
          role:
            typeof payload.role === "string"
              ? payload.role
              : Array.isArray(payload.role)
                ? payload.role[0]
                : "member",
          isActive,
          details: {
            create: {
              companyId,
              name: payload.name ? String(payload.name).trim() : null,
              email: payload.email ? String(payload.email).trim() : null,
              phone: payload.phone ? String(payload.phone).trim() : null,
              position: payload.position
                ? String(payload.position).trim()
                : null,
              dob: payload.dob ? String(payload.dob).trim() : null,
              joined: payload.joined ? String(payload.joined).trim() : null,
            },
          },
        },
        include: {
          details: { include: { company: true } },
          deviceSessions: true,
          attendanceLogs: { orderBy: { createdAt: "desc" } },
          attendanceRequests: true,
        },
      });

      // Direct sync to Cloudflare D1
      try {
        await d1Client.execute(
          `INSERT OR REPLACE INTO User (system_id, id, username, password_hash, role, is_active)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            systemId,
            cleanId,
            cleanUsername,
            finalHash,
            typeof payload.role === "string" ? payload.role : "member",
            isActive ? 1 : 0,
          ],
        );
        if (
          companyId ||
          payload.name ||
          payload.email ||
          payload.phone ||
          payload.position
        ) {
          await d1Client.execute(
            `INSERT OR REPLACE INTO UserDetails (system_id, company_id, name, email, phone, position, dob, joined)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              systemId,
              companyId || null,
              payload.name ? String(payload.name).trim() : null,
              payload.email ? String(payload.email).trim() : null,
              payload.phone ? String(payload.phone).trim() : null,
              payload.position ? String(payload.position).trim() : null,
              payload.dob ? String(payload.dob).trim() : null,
              payload.joined ? String(payload.joined).trim() : null,
            ],
          );
        }
        console.log(`[Cloudflare D1] ✅ Created user ${systemId} in Remote D1`);
      } catch (d1Err: any) {
        console.warn(
          "[Cloudflare D1] Error syncing created user to D1:",
          d1Err?.message,
        );
      }

      return res.status(201).json({
        success: true,
        data: formatUserForResponse(created),
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || "Failed to create user" },
      });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const payload: any = { ...req.body };

      // Find existing user first to get systemId
      const existing = await prisma.user.findFirst({
        where: {
          OR: [{ systemId: String(id) }, { id: String(id) }],
        },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: { message: "User not found" },
        });
      }

      // 1. Handle relational DeviceSession updates
      if (Array.isArray(payload.devices)) {
        for (const d of payload.devices) {
          if (!d.id) continue;
          const isTerm =
            d.isTerminated === true ||
            d.isTerminated === 1 ||
            d.isTerminated === "true" ||
            d.terminate === true ||
            d.terminate === "true"
              ? 1
              : 0;

          await prisma.deviceSession.upsert({
            where: { id: String(d.id) },
            create: {
              id: String(d.id),
              userId: existing.systemId,
              deviceName: d.deviceName || d.modelName || "Device",
              modelName: d.modelName || null,
              os: d.os || null,
              osVersion: d.osVersion || null,
              appVersion: d.appVersion || null,
              ipAddress: d.ip || d.ipAddress || null,
              location:
                typeof d.location === "object"
                  ? JSON.stringify(d.location)
                  : d.location || null,
              isTerminated: isTerm,
              lastActive: d.lastActive ? new Date(d.lastActive) : new Date(),
              lastLogin: d.lastLogin ? new Date(d.lastLogin) : new Date(),
            },
            update: {
              isTerminated: isTerm,
              lastActive: d.lastActive ? new Date(d.lastActive) : new Date(),
            },
          });
        }
      }

      // 2. Handle relational AttendanceLog updates
      if (Array.isArray(payload.attendance)) {
        for (const att of payload.attendance) {
          if (!att.id) continue;
          const dateStr =
            att.date ||
            att.scanDate ||
            (att.timestamp ? String(att.timestamp).split("T")[0] : "");
          const timeStr = att.time || att.scanTime || "";
          const scanType = att.type || "TIME_IN";

          await prisma.attendanceLog.upsert({
            where: { id: String(att.id) },
            create: {
              id: String(att.id),
              userId: existing.systemId,
              companyId: att.companyId || att.system_id || null,
              scanDate: dateStr,
              scanTime: timeStr,
              type: scanType,
              qrData: att.qr_data || att.qrData || null,
              createdAt: att.timestamp ? new Date(att.timestamp) : new Date(),
            },
            update: {
              scanDate: dateStr,
              scanTime: timeStr,
              type: scanType,
              qrData: att.qr_data || att.qrData || null,
            },
          });

          // Direct sync to Cloudflare D1 AttendanceLog
          try {
            await d1Client.ensureSchema();
            await d1Client.execute(
              `INSERT OR REPLACE INTO AttendanceLog (id, userId, companyId, scanDate, scanTime, type, qrData, createdAt, image, remark)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                String(att.id),
                existing.systemId,
                att.companyId || att.system_id || null,
                dateStr,
                timeStr,
                scanType,
                att.qr_data || att.qrData || null,
                att.timestamp
                  ? new Date(att.timestamp).toISOString()
                  : new Date().toISOString(),
                att.image || null,
                att.remark || null,
              ],
            );
          } catch (d1Err: any) {
            console.warn(
              "[Cloudflare D1] Attendance update error:",
              d1Err?.message,
            );
          }
        }
      }

      // 3. Handle relational AttendanceRequest updates
      if (Array.isArray(payload.requestAttendanceRules)) {
        for (const reqRule of payload.requestAttendanceRules) {
          if (!reqRule.id) continue;
          await prisma.attendanceRequest.upsert({
            where: { id: String(reqRule.id) },
            create: {
              id: String(reqRule.id),
              userId: existing.systemId,
              subject: reqRule.subject || "Attendance Request",
              remark: reqRule.remark || null,
              status: reqRule.status || "pending",
              fromDate:
                reqRule.fromDate || reqRule.from_date || reqRule.date || null,
              fromTime:
                reqRule.fromTime || reqRule.from_time || reqRule.time || null,
              toDate: reqRule.toDate || reqRule.to_date || null,
              toTime: reqRule.toTime || reqRule.to_time || null,
              createdAt: reqRule.createdAt
                ? new Date(reqRule.createdAt)
                : new Date(),
            },
            update: {
              status: reqRule.status || "pending",
              remark: reqRule.remark || null,
              toDate: reqRule.toDate || reqRule.to_date || null,
              toTime: reqRule.toTime || reqRule.to_time || null,
            },
          });
        }
      }

      // 4. Update core user fields
      const userUpdateData: any = {};
      const detailsUpdateData: any = {};

      if (payload.role !== undefined) {
        userUpdateData.role =
          typeof payload.role === "string"
            ? payload.role
            : Array.isArray(payload.role)
              ? payload.role[0]
              : "member";
      }
      if (payload.isActive !== undefined)
        userUpdateData.isActive = Boolean(payload.isActive);
      if (payload.is_active !== undefined)
        userUpdateData.isActive = Boolean(payload.is_active);

      if (payload.password) {
        const rawPass = String(payload.password).trim();
        userUpdateData.passwordHash =
          rawPass.startsWith("$2a$") || rawPass.startsWith("$2b$")
            ? rawPass
            : bcrypt.hashSync(rawPass, 10);
      } else if (payload.passwordHash) {
        userUpdateData.passwordHash = payload.passwordHash;
      }

      // 5. Update user details fields
      if (payload.name !== undefined) detailsUpdateData.name = payload.name;
      if (payload.email !== undefined) detailsUpdateData.email = payload.email;
      if (payload.phone !== undefined) detailsUpdateData.phone = payload.phone;
      if (payload.position !== undefined)
        detailsUpdateData.position = payload.position;
      if (payload.dob !== undefined) detailsUpdateData.dob = payload.dob;
      if (payload.joined !== undefined)
        detailsUpdateData.joined = payload.joined;

      const compId =
        payload.companyId ||
        payload.company_id ||
        payload.systemId ||
        payload.system_id;
      if (compId !== undefined) detailsUpdateData.companyId = compId;

      if (Object.keys(detailsUpdateData).length > 0) {
        await prisma.userDetails.upsert({
          where: { systemId: existing.systemId },
          create: {
            systemId: existing.systemId,
            ...detailsUpdateData,
          },
          update: detailsUpdateData,
        });
      }

      let updated = null;
      if (Object.keys(userUpdateData).length > 0) {
        updated = await prisma.user.update({
          where: { systemId: existing.systemId },
          data: userUpdateData,
          include: {
            details: { include: { company: true } },
            deviceSessions: true,
            attendanceLogs: true,
            attendanceRequests: true,
          },
        });
      } else {
        updated = await prisma.user.findUnique({
          where: { systemId: existing.systemId },
          include: {
            details: { include: { company: true } },
            deviceSessions: true,
            attendanceLogs: true,
            attendanceRequests: true,
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: formatUserForResponse(updated),
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || "Failed to update user" },
      });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await prisma.user.findFirst({
        where: {
          OR: [{ systemId: String(id) }, { id: String(id) }],
        },
      });

      if (existing) {
        await prisma.user.delete({
          where: { systemId: existing.systemId },
        });

        // Delete from Cloudflare D1
        try {
          await d1Client.execute(
            "DELETE FROM UserDetails WHERE system_id = ?",
            [existing.systemId],
          );
          await d1Client.execute("DELETE FROM AttendanceLog WHERE userId = ?", [
            existing.systemId,
          ]);
          await d1Client.execute("DELETE FROM DeviceSession WHERE userId = ?", [
            existing.systemId,
          ]);
          await d1Client.execute(
            "DELETE FROM User WHERE system_id = ? OR id = ?",
            [existing.systemId, existing.id],
          );
          console.log(
            `[Cloudflare D1] ✅ Deleted user ${existing.systemId} from Remote D1`,
          );
        } catch (d1Err: any) {
          console.warn(
            "[Cloudflare D1] Error deleting user from Remote D1:",
            d1Err?.message,
          );
        }
      }

      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || "Failed to delete user" },
      });
    }
  }
}

export const usersController = new UsersController();
