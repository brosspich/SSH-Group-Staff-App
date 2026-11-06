import { d1Client } from "../../infrastructure/database/d1Client.js";
import { prisma } from "../../infrastructure/database/prisma.js";
import { r2Storage } from "../../infrastructure/storage/r2.service.js";
import {
  AttendanceRecordDto,
  ConfirmAttendancePayload,
  ConfirmAttendanceResult,
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
  getCoordinatesList,
  isVpnSubnet,
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

    // Default to previewOnly (scan stage before user taps Submit):
    // Do NOT write to DB, and do NOT send to Telegram on scan!
    if (payload.previewOnly !== false) {
      return {
        allowed: true,
        record: newRecord,
      };
    }

    // ── 7. Save to Database (Cloudflare D1 AttendanceLog table) ──
    const scanLogId = `${user.id}_${nextId}_${Date.now()}`;
    const scanDbType = evaluatedType.toUpperCase().replace("-", "_");
    try {
      await d1Client.ensureSchema();
      await d1Client.execute(
        `INSERT OR REPLACE INTO AttendanceLog (id, userId, companyId, scanDate, scanTime, type, qrData, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          scanLogId,
          user.systemId,
          company.id,
          dateStr,
          timeStr,
          scanDbType,
          qrData,
          now.toISOString(),
        ],
      );
      console.log(`[Cloudflare D1] ✅ Stored attendance scan log ${scanLogId}`);
    } catch (e: any) {
      console.warn("[Cloudflare D1] AttendanceLog insert warning:", e?.message);
    }

    try {
      await prisma.attendanceLog.create({
        data: {
          id: scanLogId,
          userId: user.systemId,
          companyId: company.id,
          scanDate: dateStr,
          scanTime: timeStr,
          type: scanDbType,
          qrData,
          createdAt: now,
        },
      });
    } catch {}

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

  /**
   * Commits Attendance to Database & Dispatches Telegram Notification (Backend 70%).
   * Triggered when the user taps "Submit" on the Confirm Attendance modal.
   */
  async confirmAttendance(
    payload: ConfirmAttendancePayload,
    clientIp?: string,
  ): Promise<ConfirmAttendanceResult> {
    const { userId, qrData, date, time, type, timestamp } = payload;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ systemId: userId }, { id: userId }],
      },
      include: {
        details: { include: { company: true } },
      },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} does not exist.`);
    }

    const company =
      user.details?.company ||
      (await prisma.company.findFirst({ orderBy: { id: "asc" } }));

    if (!company) {
      throw new Error("User is not assigned to an active company.");
    }

    const now = timestamp ? new Date(timestamp) : new Date();
    const dateStr = date || formatServerDateYMD(now);
    const timeStr = time || formatServerTime12h(now);
    const effectiveType = type || "time-in";

    // 1. Generate sequential record ID
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

    // ── Upload Proof Image to Cloudflare R2 (ssh-storage) ──
    let storedImageUrl: string | undefined = undefined;
    let imageBuffer: Buffer | null = null;
    let imageMimeType = "image/jpeg";

    if (payload.image && payload.image.trim()) {
      try {
        const rawImg = payload.image.trim();
        let buffer: Buffer | null = null;
        let ext = "jpeg";
        let mimeType = "image/jpeg";

        if (rawImg.startsWith("data:image/")) {
          const match = rawImg.match(
            /^data:image\/([a-zA-Z0-9.+]+);base64,(.+)$/,
          );
          if (match) {
            ext = match[1] === "png" ? "png" : "jpeg";
            mimeType = match[1] === "png" ? "image/png" : "image/jpeg";
            buffer = Buffer.from(match[2], "base64");
          } else {
            buffer = Buffer.from(
              rawImg.replace(/^data:image\/\w+;base64,/, ""),
              "base64",
            );
          }
        } else if (
          rawImg.startsWith("http://") ||
          rawImg.startsWith("https://")
        ) {
          storedImageUrl = rawImg;
        } else if (/^[A-Za-z0-9+/=]+$/.test(rawImg.slice(0, 100))) {
          buffer = Buffer.from(rawImg, "base64");
        }

        if (buffer && buffer.length > 0) {
          imageBuffer = buffer;
          imageMimeType = mimeType;
          // Key format: staff-attendance/{system_id_or_userId}/{date}/{timestamp}.ext
          const userFolder = user.systemId || user.id;
          const fileName = `${Date.now()}_proof.${ext}`;
          const r2Key = `staff-attendance/${userFolder}/${dateStr}/${fileName}`;
          storedImageUrl = await r2Storage.uploadFile(r2Key, buffer, mimeType);
          console.log(
            `[Attendance] Stored proof image in Cloudflare R2: ${storedImageUrl}`,
          );
        }
      } catch (err: any) {
        console.warn(
          "[Attendance] Cloudflare R2 proof image upload failed:",
          err?.message,
        );
      }
    }

    const record: AttendanceRecordDto = {
      id: nextId,
      staff_id: user.id,
      system_id: company.id,
      name:
        payload.name || user.details?.name || user.username || "Staff Member",
      date: dateStr,
      time: timeStr,
      type: effectiveType,
      timestamp: now.toISOString(),
      qr_data: qrData,
      remark: payload.remark,
      image: storedImageUrl || payload.image,
    };

    // 2. Persist directly to Remote Cloudflare D1 AttendanceLog (Database)
    const logId = `${user.id}_${nextId}_${Date.now()}`;
    const dbType = effectiveType.toUpperCase().replace("-", "_");

    try {
      await d1Client.ensureSchema();
      await d1Client.execute(
        `INSERT OR REPLACE INTO AttendanceLog (id, userId, companyId, scanDate, scanTime, type, qrData, createdAt, image, remark)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          logId,
          user.systemId,
          company.id,
          dateStr,
          timeStr,
          dbType,
          qrData,
          now.toISOString(),
          storedImageUrl || null,
          payload.remark || null,
        ],
      );
      console.log(
        `[Cloudflare D1] ✅ Successfully stored AttendanceLog to Remote D1 for ${user.id} (${user.systemId}) with image: ${storedImageUrl || "none"}`,
      );
    } catch (d1Err: any) {
      console.warn(
        "[Cloudflare D1] Error storing to Remote D1:",
        d1Err?.message,
      );
    }

    // Local Prisma fallback/cache
    try {
      await prisma.attendanceLog.create({
        data: {
          id: logId,
          userId: user.systemId,
          companyId: company.id,
          scanDate: dateStr,
          scanTime: timeStr,
          type: dbType,
          qrData,
          image: storedImageUrl || null,
          remark: payload.remark || null,
          createdAt: now,
        },
      });
    } catch {}

    // Also sync to legacy ssh_group_staff_users if present
    try {
      const updatedAttendanceList = [record, ...existingList];
      await prisma.$executeRawUnsafe(
        "UPDATE ssh_group_staff_users SET attendance = ? WHERE id = ?",
        JSON.stringify(updatedAttendanceList),
        user.id,
      );
    } catch {}

    // 3. Dispatch Telegram Notification
    console.log(
      `[Attendance] Dispatching Telegram alert for user ${user.id} to company ${company.name}`,
    );
    await this.sendTelegramNotification(
      company,
      record,
      imageBuffer,
      imageMimeType,
    ).catch((err) => {
      console.warn("Error sending Telegram notification:", err);
    });
    console.log(`[Attendance] Telegram alert dispatched.`);

    return {
      success: true,
      record,
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

    // Fallback and multi-branch enhancement: merge pre-resolved coordinates for companyId (e.g. system-0002 branches)
    if (companyId) {
      const branchCoords = getCoordinatesList(companyId);
      for (const branch of branchCoords) {
        const alreadyExists = companyCoords.some(
          (c) =>
            Math.abs(c.latitude - branch.latitude) < 0.0001 &&
            Math.abs(c.longitude - branch.longitude) < 0.0001,
        );
        if (!alreadyExists) {
          companyCoords.push(branch);
        }
      }
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
    imageBuffer?: Buffer | null,
    imageMimeType: string = "image/jpeg",
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

    const lines = [
      `🔔 <b>Attendance Scan Alert</b>`,
      `🆔 <b>Staff ID:</b> ${record.staff_id}`,
      `👤 <b>Staff:</b> ${record.name}`,
      `📌 <b>Status:</b> ${typeEmoji}`,
      `📅 <b>Date:</b> ${record.date}`,
      `⏰ <b>Time:</b> ${record.time}`,
    ];

    if (record.remark) {
      lines.push(`📝 <b>Remark:</b> ${record.remark}`);
    }

    if (record.image || (imageBuffer && imageBuffer.length > 0)) {
      if (
        record.image &&
        (record.image.startsWith("http://") ||
          record.image.startsWith("https://")) &&
        !record.image.includes("r2.cloudflarestorage.com")
      ) {
        lines.push(
          `📷 <b>Proof Image:</b> <a href="${record.image}">View Photo</a>`,
        );
      } else {
        // lines.push(`📷 <b>Proof Image:</b> [Photo Attached]`);
      }
    }

    const message = lines.join("\n");

    for (const chatId of rawChats) {
      if (!chatId) continue;
      try {
        let sentPhoto = false;

        // Check if we have an image buffer to upload as multipart photo
        let directBuffer = imageBuffer;
        let mime = imageMimeType;

        if (!directBuffer && record.image) {
          const rawImg = record.image.trim();
          if (rawImg.startsWith("data:image/")) {
            const match = rawImg.match(
              /^data:image\/([a-zA-Z0-9.+]+);base64,(.+)$/,
            );
            if (match) {
              mime = match[1] === "png" ? "image/png" : "image/jpeg";
              directBuffer = Buffer.from(match[2], "base64");
            } else {
              directBuffer = Buffer.from(
                rawImg.replace(/^data:image\/\w+;base64,/, ""),
                "base64",
              );
            }
          } else if (/^[A-Za-z0-9+/=]+$/.test(rawImg.slice(0, 100))) {
            directBuffer = Buffer.from(rawImg, "base64");
          }
        }

        if (directBuffer && directBuffer.length > 0) {
          try {
            console.log(
              `[Telegram] Sending photo multipart (${directBuffer.length} bytes) to chatId ${chatId}...`,
            );
            const blob = new Blob([new Uint8Array(directBuffer)], {
              type: mime,
            });
            const formData = new FormData();
            formData.append("chat_id", chatId);
            formData.append("caption", message);
            formData.append("parse_mode", "HTML");
            formData.append("photo", blob, "proof.jpg");

            const photoRes = await fetch(
              `https://api.telegram.org/bot${botToken}/sendPhoto`,
              {
                method: "POST",
                body: formData,
              },
            );

            if (photoRes.ok) {
              sentPhoto = true;
              console.log(
                `[Telegram] ✅ Photo alert successfully delivered to chatId ${chatId}`,
              );
            } else {
              const errBody = await photoRes.text();
              console.warn(
                `[Telegram sendPhoto failed] Status ${photoRes.status}:`,
                errBody,
              );
            }
          } catch (photoErr) {
            console.warn("[Telegram] Error sending photo multipart:", photoErr);
          }
        } else if (
          record.image &&
          (record.image.startsWith("http://") ||
            record.image.startsWith("https://")) &&
          !record.image.includes("r2.cloudflarestorage.com")
        ) {
          try {
            const photoRes = await fetch(
              `https://api.telegram.org/bot${botToken}/sendPhoto`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: chatId,
                  photo: record.image,
                  caption: message,
                  parse_mode: "HTML",
                }),
              },
            );

            if (photoRes.ok) {
              sentPhoto = true;
              console.log(
                `[Telegram] ✅ Photo URL successfully sent to chatId ${chatId}`,
              );
            }
          } catch (photoErr) {
            console.warn("[Telegram] Error sending photo URL:", photoErr);
          }
        }

        // If photo was dispatched successfully with caption, skip duplicate text
        if (sentPhoto) continue;

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "HTML",
          }),
        });
      } catch (sendErr) {
        console.warn(
          `[Telegram] Failed dispatching to chatId ${chatId}:`,
          sendErr,
        );
      }
    }
  }
}

export const attendanceSecurityService = new AttendanceSecurityService();
