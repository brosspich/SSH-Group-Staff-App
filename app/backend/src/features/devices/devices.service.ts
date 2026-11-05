import { prisma } from "../../infrastructure/database/prisma.js";
import { DeviceSessionDto, SyncDevicePayload } from "./devices.types.js";

function parseJsonField(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
      return [parsed];
    } catch {
      return [];
    }
  }
  return [];
}

export class DevicesService {
  /**
   * Fetches device sessions for a user from DeviceSession table and legacy fallback.
   */
  async getUserSessions(userId: string): Promise<DeviceSessionDto[]> {
    if (!userId) return [];

    const sessions = await prisma.deviceSession.findMany({
      where: { userId },
      orderBy: { lastActive: "desc" },
    });

    if (sessions.length > 0) {
      return sessions.map((s) => ({
        id: s.id,
        userId: s.userId,
        deviceName: s.deviceName || "Unknown",
        modelName: s.modelName || "",
        os: s.os || "Unknown",
        osVersion: s.osVersion || "",
        appVersion: s.appVersion || "1.0.0",
        ipAddress: s.ipAddress || "",
        location: s.location,
        isTerminated: s.isTerminated === 1,
        lastActive: s.lastActive.toISOString(),
        lastLogin: s.lastLogin.toISOString(),
      }));
    }

    // Legacy fallback: check user.devices JSON column
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const legacy = parseJsonField((user as any).devices);
      return legacy.map((d: any) => ({
        id: d.id || `session_${Date.now()}`,
        userId,
        deviceName: d.device_name || d.deviceName || "Unknown",
        modelName: d.model_name || d.modelName || "",
        os: d.os || "Unknown",
        osVersion: d.os_version || d.osVersion || "",
        appVersion: d.app_version || d.appVersion || "1.0.0",
        ipAddress: d.ip_address || d.ipAddress || "",
        location: d.location || "Phnom Penh, Cambodia",
        isTerminated: d.terminate === "true" || d.isTerminated === true,
        lastActive: d.last_active || d.lastActive || new Date().toISOString(),
        lastLogin: d.last_login || d.lastLogin || new Date().toISOString(),
      }));
    }

    return [];
  }

  /**
   * Syncs / Registers device session (Server-side condition: limit active devices).
   */
  async syncDevice(
    payload: SyncDevicePayload,
    clientIp?: string,
  ): Promise<DeviceSessionDto> {
    const { userId, deviceName } = payload;
    if (!userId) throw new Error("userId is required to sync device session.");

    const id =
      payload.sessionId ||
      `session_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    const now = new Date();
    const effectiveIp = payload.ipAddress || clientIp || "127.0.0.1";

    // 1. Create or update session in DeviceSession table
    const session = await prisma.deviceSession.upsert({
      where: { id },
      create: {
        id,
        userId,
        deviceName: deviceName || "Mobile Device",
        modelName: payload.modelName || deviceName || "Unknown Device",
        os: payload.os || "Mobile",
        osVersion: payload.osVersion || "1.0",
        appVersion: payload.appVersion || "1.0.0",
        ipAddress: effectiveIp,
        location: payload.location || "Phnom Penh, Cambodia",
        isTerminated: 0,
        lastActive: now,
        lastLogin: now,
      },
      update: {
        deviceName: deviceName || undefined,
        modelName: payload.modelName || undefined,
        ipAddress: effectiveIp,
        location: payload.location || undefined,
        lastActive: now,
        isTerminated: 0,
      },
    });

    // 2. Condition: If active sessions > 5, auto-terminate oldest sessions
    const activeSessions = await prisma.deviceSession.findMany({
      where: { userId, isTerminated: 0 },
      orderBy: { lastActive: "desc" },
    });

    if (activeSessions.length > 5) {
      const toTerminate = activeSessions.slice(5);
      await prisma.deviceSession.updateMany({
        where: { id: { in: toTerminate.map((s) => s.id) } },
        data: { isTerminated: 1 },
      });
    }

    return {
      id: session.id,
      userId: session.userId,
      deviceName: session.deviceName || "Unknown",
      modelName: session.modelName || "",
      os: session.os || "Unknown",
      osVersion: session.osVersion || "",
      appVersion: session.appVersion || "1.0.0",
      ipAddress: session.ipAddress || "",
      location: session.location,
      isTerminated: session.isTerminated === 1,
      lastActive: session.lastActive.toISOString(),
      lastLogin: session.lastLogin.toISOString(),
    };
  }

  /**
   * Terminates a single session.
   */
  async terminateSession(sessionId: string): Promise<boolean> {
    try {
      await prisma.deviceSession.update({
        where: { id: sessionId },
        data: { isTerminated: 1 },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Terminates all other sessions except current.
   */
  async terminateOtherSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<number> {
    const res = await prisma.deviceSession.updateMany({
      where: {
        userId,
        id: { not: currentSessionId },
        isTerminated: 0,
      },
      data: { isTerminated: 1 },
    });
    return res.count;
  }
}

export const devicesService = new DevicesService();
