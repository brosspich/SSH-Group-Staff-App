import { prisma } from "../../infrastructure/database/prisma.js";
import {
  AttendanceRecordDto,
  ProcessScanPayload,
  ProcessScanResult,
  SecurityCheckResult,
  VerifySecurityPayload,
} from "./attendance-security.types.js";
import {
  calculateHaversineDistanceMeters,
  evaluateAttendanceType,
  formatServerDateYMD,
  formatServerTime12h,
  generateNextAttendanceId,
  isVpnSubnet,
  parseCoordinates,
  resolveCoordinatesAsync,
  validateQrCode,
} from "./attendance-security.utils.js";

export class AttendanceSecurityService {
  /**
   * Evaluates geofencing and device security conditions on the backend.
   */
  async verifySecurity(
    payload: VerifySecurityPayload,
    clientIp?: string,
  ): Promise<SecurityCheckResult> {
    const { latitude, longitude, isMocked, ipAddress } = payload;

    // ── Condition 1: Mocked / Spoofed Location ──
    if (isMocked) {
      return {
        allowed: false,
        code: "MOCK_LOCATION",
        reason:
          "Mocked or spoofed location detected! Fake GPS apps are prohibited for attendance.",
        latitude,
        longitude,
      };
    }

    // ── Condition 2: VPN / Proxy Detection ──
    const effectiveIp = ipAddress || clientIp;
    if (isVpnSubnet(effectiveIp)) {
      return {
        allowed: false,
        code: "VPN_DETECTED",
        reason:
          "VPN connection detected. Please disable VPN before scanning attendance.",
        ipAddress: effectiveIp,
      };
    }

    // ── Condition 3: Find Target Company in Database ──
    const rawId = payload.systemId || payload.companyId || "";
    let targetSystemId = rawId.trim().toLowerCase();
    const match = targetSystemId.match(/^(system-\d+)/i);
    if (match) {
      targetSystemId = match[1].toLowerCase();
    }

    let company = targetSystemId
      ? await prisma.company.findUnique({
          where: { id: targetSystemId },
        })
      : null;

    if (!company) {
      company = await prisma.company.findFirst({
        orderBy: { id: "asc" },
      });
    }

    if (!company) {
      return {
        allowed: false,
        code: "COMPANY_NOT_FOUND",
        reason:
          "Designated company configuration was not found in the database.",
      };
    }

    // ── Condition 4: Parse All Locations for Company ──
    const companyCoords = await this.extractCompanyCoordinates(
      company.location,
      company.id,
    );

    if (companyCoords.length === 0) {
      return {
        allowed: true,
        reason: "No geofence coordinates configured for company.",
        companyName: company.name,
        latitude,
        longitude,
      };
    }

    // ── Condition 5: Calculate Distance to All Company Locations ──
    let minDistance = Infinity;
    for (const compCoord of companyCoords) {
      const dist = calculateHaversineDistanceMeters(
        latitude,
        longitude,
        compCoord.latitude,
        compCoord.longitude,
      );
      if (dist < minDistance) {
        minDistance = dist;
      }
    }

    const allowedRadiusMeters = 150;

    // ── Condition: A vs B (A > B vs A <= B) ──
    if (minDistance > allowedRadiusMeters) {
      const roundedDist = Math.round(minDistance);
      return {
        allowed: false,
        code: "OUT_OF_RANGE",
        reason: `You are outside the ${company.name} area (${roundedDist}m away). Attendance scanning is only allowed within ${allowedRadiusMeters} meters of ${company.name}.`,
        distanceMeters: roundedDist,
        allowedRadiusMeters,
        companyName: company.name,
        latitude,
        longitude,
        ipAddress: effectiveIp,
      };
    }

    const roundedDist = Math.round(minDistance);
    return {
      allowed: true,
      distanceMeters: roundedDist,
      allowedRadiusMeters,
      companyName: company.name,
      latitude,
      longitude,
      ipAddress: effectiveIp,
    };
  }

  /**
   * Complete End-to-End Attendance Scan Processing (70% Backend).
   *
   * Responsibilities:
   * 1. Validates user existence in DB
   * 2. Evaluates GPS & VPN conditions
   * 3. Evaluates Geofence distance condition (A vs B)
   * 4. Evaluates QR Code validity condition (A == B)
   * 5. Evaluates Time Window condition (A < B, A = B, A > B)
   * 6. Generates sequential ID and saves record directly to Database!
   * 7. Dispatches Telegram notification
   */
  async processAttendanceScan(
    payload: ProcessScanPayload,
    clientIp?: string,
  ): Promise<ProcessScanResult> {
    const { userId, qrData, latitude, longitude, isMocked, ipAddress } =
      payload;

    // ── 1. Fetch User from Database ──
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ systemId: userId }, { id: userId }],
      },
      include: {
        details: { include: { company: true } },
      },
    });

    if (!user) {
      return {
        allowed: false,
        code: "USER_NOT_FOUND",
        reason: `User with ID ${userId} does not exist in the database.`,
      };
    }

    // ── 2. Determine User Company ──
    const company =
      user.details?.company ||
      (await prisma.company.findFirst({ orderBy: { id: "asc" } }));
    if (!company) {
      return {
        allowed: false,
        code: "COMPANY_NOT_FOUND",
        reason: "User is not assigned to an active company.",
      };
    }

    // ── 3. Evaluate Device Security & Geofence (Condition A vs B) ──
    if (typeof latitude === "number" && typeof longitude === "number") {
      const secCheck = await this.verifySecurity(
        {
          systemId: company.id,
          latitude,
          longitude,
          isMocked,
          ipAddress,
        },
        clientIp,
      );

      if (!secCheck.allowed) {
        return {
          allowed: false,
          code: secCheck.code,
          reason: secCheck.reason,
          distanceMeters: secCheck.distanceMeters,
        };
      }
    }

    // ── 4. Evaluate QR Code Condition (A == B) ──
    const allowedQrs = this.parseJsonField(company.qrCodes);
    const isQrValid = validateQrCode(qrData, allowedQrs);

    if (!isQrValid) {
      return {
        allowed: false,
        code: "INVALID_QR",
        reason: `Scanned QR code does not belong to ${company.name}.`,
      };
    }

    // ── 5. Evaluate Time Window Condition (A < B, A = B, A > B) ──
    const now = new Date();
    const evaluatedType = evaluateAttendanceType(
      now,
      company.timeIn || "08:00:00",
      company.timeOut || "17:00:00",
    );
    const dateStr = formatServerDateYMD(now);
    const timeStr = formatServerTime12h(now);

    // ── 6. Parse Existing Attendance & Generate Next ID ──
    let existingList: any[] = [];
    try {
      const rawUserAtt = (user as any).attendance;
      if (Array.isArray(rawUserAtt)) {
        existingList = rawUserAtt;
      } else if (typeof rawUserAtt === "string" && rawUserAtt.trim()) {
        existingList = JSON.parse(rawUserAtt);
      }
    } catch {}

    const nextId = generateNextAttendanceId(existingList);

    const newRecord: AttendanceRecordDto = {
      id: nextId,
      staff_id: user.id,
      system_id: company.id,
      name: user.details?.name || user.username || "Staff Member",
      date: dateStr,
      time: timeStr,
      type: evaluatedType,
      timestamp: now.toISOString(),
      qr_data: qrData,
    };

    // ── 7. Save to Database (AttendanceLog table) ──
    try {
      await prisma.attendanceLog.create({
        data: {
          id: `${user.id}_${nextId}_${Date.now()}`,
          userId: user.systemId,
          companyId: company.id,
          scanDate: dateStr,
          scanTime: timeStr,
          type: evaluatedType.toUpperCase().replace("-", "_"),
          qrData,
          createdAt: now,
        },
      });
    } catch (e: any) {
      console.warn("Could not insert to AttendanceLog:", e?.message);
    }

    // Also sync to legacy ssh_group_staff_users if present
    try {
      const updatedAttendanceList = [newRecord, ...existingList];
      await prisma.$executeRawUnsafe(
        "UPDATE ssh_group_staff_users SET attendance = ? WHERE id = ?",
        JSON.stringify(updatedAttendanceList),
        user.id,
      );
    } catch {}

    // ── 8. Dispatch Telegram Notification (Asynchronous / Non-blocking) ──
    this.sendTelegramNotification(company, newRecord).catch(() => {});

    return {
      allowed: true,
      record: newRecord,
    };
  }

  private async extractCompanyCoordinates(
    rawLocations: any,
    companyId?: string,
  ): Promise<{ latitude: number; longitude: number }[]> {
    let locationList: string[] = [];
    if (Array.isArray(rawLocations)) {
      locationList = rawLocations;
    } else if (typeof rawLocations === "string") {
      try {
        const parsed = JSON.parse(rawLocations);
        locationList = Array.isArray(parsed) ? parsed : [rawLocations];
      } catch {
        locationList = [rawLocations];
      }
    }

    const companyCoords: { latitude: number; longitude: number }[] = [];
    for (const locStr of locationList) {
      if (typeof locStr === "string" && locStr.trim()) {
        const coords = await resolveCoordinatesAsync(locStr);
        if (coords) companyCoords.push(coords);
      }
    }

    // Fallback: If no coordinates could be parsed from string, check by companyId
    if (companyCoords.length === 0 && companyId) {
      const fallback = parseCoordinates(companyId);
      if (fallback) companyCoords.push(fallback);
    }

    return companyCoords;
  }

  private parseJsonField(val: any): string[] {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
        return [parsed];
      } catch {
        return [val];
      }
    }
    return [val];
  }

  private async sendTelegramNotification(
    company: any,
    record: AttendanceRecordDto,
  ): Promise<void> {
    const rawTokens = this.parseJsonField(company.telegramBotToken);
    const rawChats = this.parseJsonField(company.telegramChatId);

    const botToken = rawTokens[0];
    if (!botToken || rawChats.length === 0) return;

    const typeEmoji =
      record.type === "time-in"
        ? "🟢 [TIME-IN]"
        : record.type === "time-out"
          ? "🔴 [TIME-OUT]"
          : "🟣 [TIME-OTHER]";

    const message = [
      `🔔 <b>Attendance Scan Alert</b>`,
      // `🏢 <b>Company:</b> ${company.name}`,
      `🆔 <b>Staff ID:</b> ${record.staff_id}`,
      `👤 <b>Staff:</b> ${record.name}`,
      `📌 <b>Status:</b> ${typeEmoji}`,
      `📅 <b>Date:</b> ${record.date}`,
      `⏰ <b>Time:</b> ${record.time}`,
      // `🆔 <b>Record ID:</b> <code>${record.id}</code>`,
    ].join("\n");

    for (const chatId of rawChats) {
      if (!chatId) continue;
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "HTML",
          }),
        });
      } catch {}
    }
  }
}

export const attendanceSecurityService = new AttendanceSecurityService();
