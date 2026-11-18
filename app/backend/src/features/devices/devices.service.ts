import { d1Client } from "../../infrastructure/database/d1Client.js";
import { prisma } from "../../infrastructure/database/prisma.js";
import {
  DeviceSessionDto,
  InactivePeriod,
  SyncDevicePayload,
} from "./devices.types.js";

async function generateNextSessionId(): Promise<string> {
  let maxSeq = 0;

  try {
    const sessions = await prisma.deviceSession.findMany({
      select: { id: true },
    });
    for (const s of sessions) {
      if (!s.id) continue;
      const match = s.id.match(/session-(\d{4})-(\d{4})-(\d{4})/i);
      if (match) {
        const num = parseInt(match[1] + match[2] + match[3], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
  } catch {}

  try {
    const d1Sessions = await d1Client.query<{ id: string }>(
      "SELECT id FROM DeviceSession WHERE id LIKE 'session-%';",
    );
    for (const s of d1Sessions) {
      if (!s.id) continue;
      const match = s.id.match(/session-(\d{4})-(\d{4})-(\d{4})/i);
      if (match) {
        const num = parseInt(match[1] + match[2] + match[3], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
  } catch {}

  const nextSeq = maxSeq + 1;
  const seqStr = String(nextSeq).padStart(12, "0");
  const b1 = seqStr.substring(0, 4);
  const b2 = seqStr.substring(4, 8);
  const b3 = seqStr.substring(8, 12);

  return `session-${b1}-${b2}-${b3}`;
}

async function syncSessionToD1(session: any, userId: string): Promise<void> {
  try {
    const lastActiveIso =
      session.lastActive instanceof Date
        ? session.lastActive.toISOString()
        : new Date(session.lastActive || Date.now()).toISOString();
    const lastLoginIso =
      session.lastLogin instanceof Date
        ? session.lastLogin.toISOString()
        : new Date(session.lastLogin || Date.now()).toISOString();
    const loginTimedIso =
      session.loginTimed instanceof Date
        ? session.loginTimed.toISOString()
        : new Date(
            session.loginTimed || session.lastLogin || Date.now(),
          ).toISOString();

    await d1Client.execute(
      `INSERT INTO DeviceSession (id, userId, deviceName, modelName, modelNumber, os, osVersion, appVersion, ipAddress, location, isTerminated, loginTimed, lastActive, lastLogin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         userId = excluded.userId,
         deviceName = excluded.deviceName,
         modelName = excluded.modelName,
         modelNumber = excluded.modelNumber,
         os = excluded.os,
         osVersion = excluded.osVersion,
         appVersion = excluded.appVersion,
         ipAddress = excluded.ipAddress,
         location = excluded.location,
         isTerminated = excluded.isTerminated,
         lastActive = excluded.lastActive,
         lastLogin = excluded.lastLogin;`,
      [
        session.id,
        userId,
        session.deviceName || "Mobile Device",
        session.modelName || session.deviceName || "Unknown",
        session.modelNumber || undefined,
        session.os || "Mobile",
        session.osVersion || "1.0",
        session.appVersion || "1.0.1.10311",
        session.ipAddress || "127.0.0.1",
        session.location || "Phnom Penh, Cambodia",
        session.isTerminated ? 1 : 0,
        loginTimedIso,
        lastActiveIso,
        lastLoginIso,
      ],
    );
  } catch (err: any) {
    console.warn("[Cloudflare D1] DeviceSession sync error:", err?.message);
  }
}

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
    loginTimed:
      s.loginTimed instanceof Date
        ? s.loginTimed.toISOString()
        : String(s.loginTimed || s.lastLogin || s.lastActive),
    login_timed:
      s.loginTimed instanceof Date
        ? s.loginTimed.toISOString()
        : String(s.loginTimed || s.lastLogin || s.lastActive),
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

    // Remote Cloudflare D1 fallback
    try {
      const d1Sessions = await d1Client.query<any>(
        "SELECT * FROM DeviceSession WHERE userId = ? OR userId = ? ORDER BY lastActive DESC",
        [effectiveUserId, userId],
      );
      if (d1Sessions && d1Sessions.length > 0) {
        return d1Sessions.map(mapSessionToDto);
      }
    } catch (d1Err: any) {
      console.warn(
        "[Cloudflare D1] getUserSessions fallback error:",
        d1Err?.message,
      );
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
      // Find existing session by physical device signature to avoid duplicate sessions for the same device
      const existingSessions = await prisma.deviceSession.findMany({
        where: {
          userId: effectiveUserId,
        },
        orderBy: { lastActive: "desc" },
      });

      matchedSession = existingSessions.find((s) => {
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

    const isSessionIdFormatted = (id?: string | null) =>
      Boolean(id && /^session-\d{4}-\d{4}-\d{4}$/i.test(id));

    let sessionId: string;
    if (matchedSession && isSessionIdFormatted(matchedSession.id)) {
      // Reuse existing session for this physical device
      sessionId = matchedSession.id;
    } else if (isSessionIdFormatted(payload.sessionId)) {
      sessionId = payload.sessionId!;
    } else {
      // New physical device: generate next sequential session ID
      sessionId = await generateNextSessionId();
    }

    // 2. Create or update session in DeviceSession table
    const session = await prisma.deviceSession.upsert({
      where: { id: sessionId },
      create: {
        id: sessionId,
        userId: effectiveUserId,
        deviceName: deviceName || "Mobile Device",
        modelName: payload.modelName || deviceName || "Unknown Device",
        modelNumber: payload.modelNumber || undefined,
        os: payload.os || "Mobile",
        osVersion: payload.osVersion || "1.0",
        appVersion: payload.appVersion || "1.0.1.10311",
        ipAddress: effectiveIp,
        location: payload.location || "Phnom Penh, Cambodia",
        isTerminated: 0,
        loginTimed: now,
        lastActive: now,
        lastLogin: now,
      },
      update: {
        userId: effectiveUserId,
        deviceName: deviceName || undefined,
        modelName: payload.modelName || undefined,
        modelNumber: payload.modelNumber || undefined,
        os: payload.os || undefined,
        osVersion: payload.osVersion || undefined,
        ipAddress: effectiveIp,
        location: payload.location || undefined,
        appVersion: payload.appVersion || "1.0.1.10311",
        lastActive: now,
        lastLogin: payload.isExplicitLogin ? now : undefined,
        isTerminated: 0,
        // loginTimed is intentionally preserved and never overwritten on update
      },
    });

    // 3. Deduplicate: Terminate older active duplicate sessions for this exact physical device
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const otherActiveSessions = await prisma.deviceSession.findMany({
      where: {
        userId: effectiveUserId,
        isTerminated: 0,
        id: { not: session.id },
      },
    });

    const duplicatesToTerminate = otherActiveSessions
      .filter((s) => {
        // Guard against race conditions: never terminate sessions active within the last 2 minutes
        if (s.lastActive && s.lastActive > twoMinutesAgo) return false;
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
      try {
        const placeholders = duplicatesToTerminate.map(() => "?").join(",");
        await d1Client.execute(
          `UPDATE DeviceSession SET isTerminated = 1 WHERE id IN (${placeholders});`,
          duplicatesToTerminate,
        );
      } catch (err: any) {
        console.warn(
          "[Cloudflare D1] Terminate duplicates error:",
          err?.message,
        );
      }
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
      const ids = oldestToTerminate.map((s) => s.id);
      await prisma.deviceSession.updateMany({
        where: { id: { in: ids } },
        data: { isTerminated: 1 },
      });
      try {
        const placeholders = ids.map(() => "?").join(",");
        await d1Client.execute(
          `UPDATE DeviceSession SET isTerminated = 1 WHERE id IN (${placeholders});`,
          ids,
        );
      } catch (err: any) {
        console.warn("[Cloudflare D1] Terminate oldest error:", err?.message);
      }
    }

    // 5. Sync newly created or updated session to Cloudflare D1
    await syncSessionToD1(session, effectiveUserId);

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
      try {
        await d1Client.execute(
          "UPDATE DeviceSession SET isTerminated = 1 WHERE id = ?;",
          [sessionId],
        );
      } catch (err: any) {
        console.warn("[Cloudflare D1] terminateSession error:", err?.message);
      }
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

    try {
      if (currentSessionId) {
        await d1Client.execute(
          "UPDATE DeviceSession SET isTerminated = 1 WHERE (userId = ? OR userId = ?) AND id != ?;",
          [effectiveUserId, userId, currentSessionId],
        );
      } else {
        await d1Client.execute(
          "UPDATE DeviceSession SET isTerminated = 1 WHERE (userId = ? OR userId = ?);",
          [effectiveUserId, userId],
        );
      }
    } catch (err: any) {
      console.warn(
        "[Cloudflare D1] terminateOtherSessions error:",
        err?.message,
      );
    }

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

    try {
      const cutoffIso = cutoffDate.toISOString();
      if (currentSessionId) {
        await d1Client.execute(
          "UPDATE DeviceSession SET isTerminated = 1 WHERE (userId = ? OR userId = ?) AND isTerminated = 0 AND id != ? AND lastActive < ?;",
          [effectiveUserId, userId, currentSessionId, cutoffIso],
        );
      } else {
        await d1Client.execute(
          "UPDATE DeviceSession SET isTerminated = 1 WHERE (userId = ? OR userId = ?) AND isTerminated = 0 AND lastActive < ?;",
          [effectiveUserId, userId, cutoffIso],
        );
      }
    } catch (err: any) {
      console.warn(
        "[Cloudflare D1] autoTerminateInactiveSessions error:",
        err?.message,
      );
    }

    return res.count;
  }
}

export const devicesService = new DevicesService();
