import bcrypt from "bcryptjs";
import { Request, Response } from "express";
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

  // Format device sessions into devices array
  const devices = (user.deviceSessions || []).map((d: any) => ({
    id: d.id,
    deviceName: d.deviceName,
    modelName: d.modelName,
    os: d.os,
    osVersion: d.osVersion,
    appVersion: d.appVersion,
    ip: d.ipAddress,
    ipAddress: d.ipAddress,
    location: parseJsonSafe(d.location),
    isTerminated: d.isTerminated === 1 ? "true" : "false",
    terminate: d.isTerminated === 1 ? "true" : "false",
    lastActive:
      d.lastActive instanceof Date ? d.lastActive.toISOString() : d.lastActive,
    lastLogin:
      d.lastLogin instanceof Date ? d.lastLogin.toISOString() : d.lastLogin,
  }));

  // Format attendance logs into attendance array with full backward-compatibility
  const attendance = (user.attendanceLogs || []).map((a: any) => ({
    id: a.id,
    staff_id: user.id,
    staffId: user.id,
    userId: user.id,
    name: user.name || "",
    system_id: a.companyId || user.companyId || null,
    systemId: a.companyId || user.companyId || null,
    companyId: a.companyId || user.companyId || null,
    date: a.scanDate,
    scanDate: a.scanDate,
    time: a.scanTime,
    scanTime: a.scanTime,
    type: a.type,
    qr_data: a.qrData,
    qrData: a.qrData,
    timestamp:
      a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
    createdAt:
      a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
  }));

  // Format attendance requests into requestAttendanceRules array with full backward-compatibility
  const requestAttendanceRules = (user.attendanceRequests || []).map(
    (r: any) => ({
      id: r.id,
      staff_id: user.id,
      staffId: user.id,
      userId: user.id,
      name: user.name || "",
      position: user.position || "",
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

  const systemId = user.companyId || user.company?.id || null;

  return {
    id: user.id,
    staff_id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    phone: user.phone,
    position: user.position,
    role: user.role,
    isActive: user.isActive,
    is_active: user.isActive,
    systemId: systemId,
    system_id: systemId,
    companyId: user.companyId,
    company_id: user.companyId,
    company: user.company,
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

      const where: any = {};
      if (search) {
        where.OR = [
          { username: { contains: String(search) } },
          { email: { contains: String(search) } },
          { name: { contains: String(search) } },
          { id: String(search) },
        ];
      } else {
        if (id) where.id = String(id);
        if (username) where.username = String(username);
        if (email) where.email = String(email);
        const compId = companyId || systemId;
        if (compId) where.companyId = String(compId);
      }

      const users = await prisma.user.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        include: {
          company: true,
          deviceSessions: true,
          attendanceLogs: true,
          attendanceRequests: true,
        },
        orderBy: [{ id: "asc" }, { companyId: "asc" }],
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
      const user = await prisma.user.findUnique({
        where: { id: String(id) },
        include: {
          company: true,
          deviceSessions: true,
          attendanceLogs: true,
          attendanceRequests: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: "User not found" },
        });
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
        select: { id: true, companyId: true },
      });

      let maxSuffix = 0;
      const targetPrefix = `${prefix}-`;

      for (const u of users) {
        const uId = String(u.id || "").toLowerCase();
        if (uId.startsWith(targetPrefix)) {
          const numMatch = uId.slice(targetPrefix.length).match(/^(\d+)/);
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

      // Backend Condition: Staff ID must be unique
      const cleanId = payload.id ? String(payload.id).trim() : undefined;
      if (cleanId) {
        const existingId = await prisma.user.findUnique({
          where: { id: cleanId },
        });
        if (existingId) {
          return res.status(400).json({
            success: false,
            error: {
              message: `Staff ID "${cleanId}" already exists. Please assign a different ID.`,
            },
          });
        }
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

      const companyId =
        payload.companyId ||
        payload.company_id ||
        payload.systemId ||
        payload.system_id ||
        null;
      const isActive =
        payload.isActive !== undefined
          ? Boolean(payload.isActive)
          : payload.is_active !== undefined
            ? Boolean(payload.is_active)
            : true;

      const created = await prisma.user.create({
        data: {
          id: cleanId,
          username: cleanUsername,
          email: payload.email ? String(payload.email).trim() : null,
          passwordHash: finalHash,
          name: payload.name ? String(payload.name).trim() : null,
          phone: payload.phone ? String(payload.phone).trim() : null,
          position: payload.position ? String(payload.position).trim() : null,
          role:
            typeof payload.role === "string"
              ? payload.role
              : Array.isArray(payload.role)
                ? payload.role[0]
                : "member",
          isActive: isActive,
          companyId: companyId,
        },
        include: {
          company: true,
          deviceSessions: true,
          attendanceLogs: true,
          attendanceRequests: true,
        },
      });

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

      // 1. Handle relational DeviceSession updates
      if (Array.isArray(payload.devices)) {
        for (const d of payload.devices) {
          if (!d.id) continue;
          const isTerminated =
            d.terminate === "true" ||
            d.isTerminated === "true" ||
            d.isTerminated === 1
              ? 1
              : 0;

          const lastActiveVal = d.lastActive || d.last_active;
          const lastLoginVal = d.lastLogin || d.last_login;
          const ipVal = d.ipAddress || d.ip_address || d.ip || null;

          await prisma.deviceSession.upsert({
            where: { id: String(d.id) },
            create: {
              id: String(d.id),
              userId: String(id),
              deviceName: d.deviceName || d.device_name || null,
              modelName: d.modelName || d.model_name || null,
              os: d.os || null,
              osVersion: d.osVersion || d.os_version || null,
              appVersion: d.appVersion || d.app_version || null,
              ipAddress: ipVal,
              location:
                typeof d.location === "object"
                  ? JSON.stringify(d.location)
                  : d.location || null,
              isTerminated: isTerminated,
              lastActive: lastActiveVal ? new Date(lastActiveVal) : new Date(),
              lastLogin: lastLoginVal ? new Date(lastLoginVal) : new Date(),
            },
            update: {
              deviceName: d.deviceName || d.device_name || undefined,
              modelName: d.modelName || d.model_name || undefined,
              os: d.os || undefined,
              osVersion: d.osVersion || d.os_version || undefined,
              appVersion: d.appVersion || d.app_version || undefined,
              ipAddress: ipVal !== null ? ipVal : undefined,
              location:
                typeof d.location === "object"
                  ? JSON.stringify(d.location)
                  : d.location !== undefined
                    ? d.location
                    : undefined,
              isTerminated: isTerminated,
              lastActive: lastActiveVal ? new Date(lastActiveVal) : new Date(),
              lastLogin: lastLoginVal ? new Date(lastLoginVal) : undefined,
            },
          });
        }
      }

      // 2. Handle relational AttendanceLog updates
      if (Array.isArray(payload.attendance)) {
        for (const a of payload.attendance) {
          if (!a.id) continue;
          await prisma.attendanceLog.upsert({
            where: { id: String(a.id) },
            create: {
              id: String(a.id),
              userId: String(id),
              companyId: a.companyId || a.system_id || null,
              scanDate: a.scanDate || new Date().toISOString().split("T")[0],
              scanTime: a.scanTime || new Date().toLocaleTimeString(),
              type: a.type || "TIME_IN",
              qrData: a.qrData || null,
            },
            update: {
              scanDate: a.scanDate || undefined,
              scanTime: a.scanTime || undefined,
              type: a.type || undefined,
              qrData: a.qrData || undefined,
            },
          });
        }
      }

      // 3. Handle relational AttendanceRequest updates
      const reqList =
        payload.requestAttendanceRules || payload.request_attendance_rules;
      if (Array.isArray(reqList)) {
        for (const r of reqList) {
          if (!r.id) continue;
          await prisma.attendanceRequest.upsert({
            where: { id: String(r.id) },
            create: {
              id: String(r.id),
              userId: String(id),
              subject: r.subject || "Attendance Request",
              remark: r.remark || null,
              status: r.status || "pending",
              fromDate: r.fromDate || null,
              fromTime: r.fromTime || null,
              toDate: r.toDate || null,
              toTime: r.toTime || null,
            },
            update: {
              subject: r.subject || undefined,
              remark: r.remark || undefined,
              status: r.status || undefined,
              fromDate: r.fromDate || undefined,
              fromTime: r.fromTime || undefined,
              toDate: r.toDate || undefined,
              toTime: r.toTime || undefined,
            },
          });
        }
      }

      // 4. Update core User scalar attributes if present
      const userUpdateData: any = {};
      if (payload.name !== undefined) userUpdateData.name = payload.name;
      if (payload.phone !== undefined) userUpdateData.phone = payload.phone;
      if (payload.position !== undefined)
        userUpdateData.position = payload.position;
      if (payload.email !== undefined) userUpdateData.email = payload.email;
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
      const compId =
        payload.companyId ||
        payload.company_id ||
        payload.systemId ||
        payload.system_id;
      if (compId !== undefined) userUpdateData.companyId = compId;

      let updated = null;
      if (Object.keys(userUpdateData).length > 0) {
        updated = await prisma.user.update({
          where: { id: String(id) },
          data: userUpdateData,
          include: {
            company: true,
            deviceSessions: true,
            attendanceLogs: true,
            attendanceRequests: true,
          },
        });
      } else {
        updated = await prisma.user.findUnique({
          where: { id: String(id) },
          include: {
            company: true,
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
      await prisma.user.delete({
        where: { id: String(id) },
      });

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
