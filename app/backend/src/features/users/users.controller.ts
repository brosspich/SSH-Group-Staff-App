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

function normalizeUserRow(u: any) {
  if (!u) return u;
  return {
    ...u,
    role: parseJsonSafe(u.role),
    devices: parseJsonSafe(u.devices),
    attendance: parseJsonSafe(u.attendance),
    request_attendance_rules: parseJsonSafe(
      u.requestAttendanceRules ?? u.request_attendance_rules,
    ),
    requestAttendanceRules: parseJsonSafe(
      u.requestAttendanceRules ?? u.request_attendance_rules,
    ),
    system_id: u.systemId ?? u.system_id,
    systemId: u.systemId ?? u.system_id,
    is_active: u.isActive ?? u.is_active,
    isActive: u.isActive ?? u.is_active,
  };
}

export class UsersController {
  async getUsers(req: Request, res: Response) {
    try {
      const { id, username, email, systemId, search } = req.query;

      const where: any = {};
      if (search) {
        where.OR = [
          { username: String(search) },
          { email: String(search) },
          { id: String(search) },
        ];
      } else {
        if (id) where.id = String(id);
        if (username) where.username = String(username);
        if (email) where.email = String(email);
        if (systemId) where.systemId = String(systemId);
      }

      const users = await prisma.staffUser.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy: { id: "asc" },
      });

      return res.status(200).json({
        success: true,
        data: users.map(normalizeUserRow),
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
      const user = await prisma.staffUser.findUnique({
        where: { id: String(id) },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: "User not found" },
        });
      }

      return res.status(200).json({
        success: true,
        data: normalizeUserRow(user),
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || "Failed to fetch user" },
      });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const payload: any = { ...req.body };

      // Map camel/snake keys to prisma model
      if (payload.system_id && !payload.systemId) {
        payload.systemId = payload.system_id;
        delete payload.system_id;
      }
      if (payload.is_active !== undefined && payload.isActive === undefined) {
        payload.isActive = payload.is_active;
        delete payload.is_active;
      }
      if (
        payload.request_attendance_rules &&
        !payload.requestAttendanceRules
      ) {
        payload.requestAttendanceRules = payload.request_attendance_rules;
        delete payload.request_attendance_rules;
      }

      for (const [key, val] of Object.entries(payload)) {
        if (val !== null && typeof val === "object" && !(val instanceof Date)) {
          payload[key] = JSON.stringify(val);
        }
      }

      const created = await prisma.staffUser.create({
        data: payload,
      });

      return res.status(201).json({
        success: true,
        data: normalizeUserRow(created),
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

      if (payload.system_id && !payload.systemId) {
        payload.systemId = payload.system_id;
        delete payload.system_id;
      }
      if (payload.is_active !== undefined && payload.isActive === undefined) {
        payload.isActive = payload.is_active;
        delete payload.is_active;
      }
      if (
        payload.request_attendance_rules &&
        !payload.requestAttendanceRules
      ) {
        payload.requestAttendanceRules = payload.request_attendance_rules;
        delete payload.request_attendance_rules;
      }

      for (const [key, val] of Object.entries(payload)) {
        if (val !== null && typeof val === "object" && !(val instanceof Date)) {
          payload[key] = JSON.stringify(val);
        }
      }

      const updated = await prisma.staffUser.update({
        where: { id: String(id) },
        data: payload,
      });

      return res.status(200).json({
        success: true,
        data: normalizeUserRow(updated),
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
      await prisma.staffUser.delete({
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
