import { prisma } from "../../infrastructure/database/prisma.js";
import {
  DeviceSessionDto,
  InactivePeriod,
  SyncDevicePayload,
} from "./devices.types.js";

function parseJsonField(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function getInactiveThresholdMs(period: InactivePeriod): number {
  switch (period) {
    case "1 day":
      return 1 * 24 * 60 * 60 * 1000;
    case "1 week":
      return 7 * 24 * 60 * 60 * 1000;
    case "3 months":
      return 90 * 24 * 60 * 60 * 1000;
    case "6 months":
      return 180 * 24 * 60 * 60 * 1000;
    case "1 year":
      return 365 * 24 * 60 * 60 * 1000;
    default:
      return 180 * 24 * 60 * 60 * 1000;
  }
}

function mapSessionToDto(s: any): DeviceSessionDto {
  const isTerm = s.isTerminated === 1;
  const isWeb = s.os === "Web" || s.os === "web";
  const isTablet =
    (s.deviceName || "").toLowerCase().includes("tablet") ||
    (s.deviceName || "").toLowerCase().includes("ipad");
  const devType = isWeb ? "web" : isTablet ? "tablet" : "phone";

  return {
    id: s.id,
    userId: s.userId,
    deviceName: s.deviceName || "Unknown",
    device_name: s.deviceName || "Unknown",
    modelName: s.modelName || "",
    model_name: s.modelName || "",
    modelNumber: s.modelNumber || undefined,
    model_number: s.modelNumber || undefined,
    deviceType: devType,
    device_type: devType,
    os: s.os || "Unknown",
    osVersion: s.osVersion || "",
    os_version: s.osVersion || "",
    appVersion: s.appVersion || "1.0.1.10311",
    app_version: s.appVersion || "1.0.1.10311",
    ipAddress: s.ipAddress || "",
    ip_address: s.ipAddress || "",
    location: s.location || "Phnom Penh, Cambodia",
    isTerminated: isTerm,
    terminate: isTerm ? "true" : "false",
    lastActive:
      s.lastActive instanceof Date
        ? s.lastActive.toISOString()
        : String(s.lastActive),
    last_active:
      s.lastActive instanceof Date
        ? s.lastActive.toISOString()
        : String(s.lastActive),
    lastLogin:
      s.lastLogin instanceof Date
        ? s.lastLogin.toISOString()
        : String(s.lastLogin),
    last_login:
      s.lastLogin instanceof Date
        ? s.lastLogin.toISOString()
        : String(s.lastLogin),
  };
}

export class DevicesService {
  /**
   * Fetches device sessions for a user from DeviceSession table and legacy fallback.
   */
  async getUserSessions(userId: string): Promise<DeviceSessionDto[]> {
    if (!userId) return [];

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ systemId: userId }, { id: userId }],
      },
    });
    const effectiveUserId = user ? user.systemId : userId;

    const sessions = await prisma.deviceSession.findMany({
      where: {
        OR: [{ userId: effectiveUserId }, { userId: userId }],
      },
      orderBy: { lastActive: "desc" },
    });

    if (sessions.length > 0) {
      return sessions.map(mapSessionToDto);
    }

    // Legacy fallback: check user.devices JSON column
    if (user) {
      const legacy = parseJsonField((user as any).devices);
      return legacy.map((d: any) =>
        mapSessionToDto({
          ...d,
          userId: user.systemId,
        }),
      );
    }

    return [];
  }

  /**
   * Syncs / Registers device session (Server-side condition: deduplication by physical device signature).
   */
  async syncDevice(
    payload: SyncDevicePayload,
    clientIp?: string,
  ): Promise<DeviceSessionDto> {
    const { userId, deviceName } = payload;
    if (!userId) throw new Error("userId is required to sync device session.");

    // Resolve systemId to satisfy foreign key constraint on User.system_id
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ systemId: userId }, { id: userId }],
      },
    });
    const effectiveUserId = user ? user.systemId : userId;

    const targetOs = (payload.os || "Mobile").trim().toLowerCase();
    const targetDeviceName = (deviceName || payload.modelName || "")
      .trim()
      .toLowerCase();
    const effectiveIp = payload.ipAddress || clientIp || "127.0.0.1";
    const now = new Date();

    // 1. Signature Matching: Check if an active session already exists for this physical device
    let matchedSession = null;
    if (payload.sessionId) {
      matchedSession = await prisma.deviceSession.findUnique({
        where: { id: payload.sessionId },
      });
    }

    if (!matchedSession) {
      // Find existing active session by physical device signature to avoid duplicate dead sessions
      const existingActiveSessions = await prisma.deviceSession.findMany({
        where: {
          userId: effectiveUserId,
          isTerminated: 0,
        },
      });

      matchedSession = existingActiveSessions.find((s) => {
        const sOs = (s.os || "").trim().toLowerCase();
        const sName = (s.deviceName || s.modelName || "").trim().toLowerCase();
        return (
          sOs === targetOs &&
          (sName === targetDeviceName ||
            sName.includes(targetDeviceName) ||
            targetDeviceName.includes(sName))
        );
      });
    }

    const sessionId =
      matchedSession?.id ||
      payload.sessionId ||
      `session_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

    // 2. Create or update session in DeviceSession table
    const session = await prisma.deviceSession.upsert({
      where: { id: sessionId },
      create: {
        id: sessionId,
        userId: effectiveUserId,
        deviceName: deviceName || "Mobile Device",
        modelName: payload.modelName || deviceName || "Unknown Device",
        os: payload.os || "Mobile",
        osVersion: payload.osVersion || "1.0",
        appVersion: payload.appVersion || "1.0.1.10311",
        ipAddress: effectiveIp,
        location: payload.location || "Phnom Penh, Cambodia",
        isTerminated: 0,
        lastActive: now,
        lastLogin: now,
      },
      update: {
        userId: effectiveUserId,
        deviceName: deviceName || undefined,
        modelName: payload.modelName || undefined,
        ipAddress: effectiveIp,
        location: payload.location || undefined,
        appVersion: payload.appVersion || "1.0.1.10311",
        osVersion: payload.osVersion || undefined,
        lastActive: now,
        lastLogin: payload.isExplicitLogin ? now : undefined,
        isTerminated: 0,
      },
    });

    // 3. Deduplicate: Terminate older active duplicate sessions for this exact physical device
    const otherActiveSessions = await prisma.deviceSession.findMany({
      where: {
        userId: effectiveUserId,
        isTerminated: 0,
        id: { not: session.id },
      },
    });

    const duplicatesToTerminate = otherActiveSessions
      .filter((s) => {
        const sOs = (s.os || "").trim().toLowerCase();
        const sName = (s.deviceName || s.modelName || "").trim().toLowerCase();
        return (
          sOs === targetOs &&
          (sName === targetDeviceName ||
            sName.includes(targetDeviceName) ||
            targetDeviceName.includes(sName))
        );
      })
      .map((s) => s.id);

    if (duplicatesToTerminate.length > 0) {
      await prisma.deviceSession.updateMany({
        where: { id: { in: duplicatesToTerminate } },
        data: { isTerminated: 1 },
      });
    }

    // 4. Condition: Limit total active sessions per user (keep max 5)
    const totalActiveSessions = await prisma.deviceSession.findMany({
      where: {
        userId: effectiveUserId,
        isTerminated: 0,
      },
      orderBy: { lastActive: "desc" },
    });

    if (totalActiveSessions.length > 5) {
      const oldestToTerminate = totalActiveSessions.slice(5);
      await prisma.deviceSession.updateMany({
        where: { id: { in: oldestToTerminate.map((s) => s.id) } },
        data: { isTerminated: 1 },
      });
    }

    return mapSessionToDto(session);
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
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ systemId: userId }, { id: userId }],
      },
    });
    const effectiveUserId = user ? user.systemId : userId;

    const res = await prisma.deviceSession.updateMany({
      where: {
        OR: [{ userId: effectiveUserId }, { userId: userId }],
        id: currentSessionId ? { not: currentSessionId } : undefined,
      },
      data: { isTerminated: 1 },
    });

    return res.count;
  }

  /**
   * Automatically terminates active sessions that have been inactive longer than chosen period.
   */
  async autoTerminateInactiveSessions(
    userId: string,
    currentSessionId: string,
    period: InactivePeriod,
  ): Promise<number> {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ systemId: userId }, { id: userId }],
      },
    });
    const effectiveUserId = user ? user.systemId : userId;
    const thresholdMs = getInactiveThresholdMs(period);
    const cutoffDate = new Date(Date.now() - thresholdMs);

    const res = await prisma.deviceSession.updateMany({
      where: {
        OR: [{ userId: effectiveUserId }, { userId: userId }],
        isTerminated: 0,
        id: currentSessionId ? { not: currentSessionId } : undefined,
        lastActive: { lt: cutoffDate },
      },
      data: { isTerminated: 1 },
    });

    return res.count;
  }
}

export const devicesService = new DevicesService();
