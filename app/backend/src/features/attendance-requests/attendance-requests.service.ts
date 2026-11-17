import { d1Client } from "../../infrastructure/database/d1Client.js";
import { prisma } from "../../infrastructure/database/prisma.js";
import { r2Storage } from "../../infrastructure/storage/r2.service.js";
import {
  AttendanceRequestRuleItemDto,
  CreateAttendanceRequestPayload,
} from "./attendance-requests.types.js";

function generateNextRequestId(
  systemId: string,
  existingRules: any[] = [],
  existingDbRecords: any[] = [],
): string {
  const cleanSystemId = (systemId || "system-0001-0000").trim();
  let maxSeq = 0;
  const allRecords = [...existingRules, ...existingDbRecords];

  for (const r of allRecords) {
    if (r?.userId && String(r.userId).trim() !== cleanSystemId) {
      continue;
    }
    if (r?.id && typeof r.id === "string") {
      const idStr = r.id.trim();
      if (idStr.startsWith("system-") && !idStr.startsWith(cleanSystemId)) {
        continue;
      }
      // 1. Standard format: system-0001-0022-REQ-0000-0001 or REQ-0000-0001
      const matchNew = idStr.match(/REQ-(\d{4})-(\d{4})(?:$|[^\d])/i);
      if (matchNew) {
        const num = parseInt(matchNew[1] + matchNew[2], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
          continue;
        }
      }
      // 2. Legacy triple-block format: REQ-0000-0000-0001
      const matchTriple = idStr.match(/REQ-(\d{4})-(\d{4})-(\d{4})/i);
      if (matchTriple) {
        const num = parseInt(
          matchTriple[1] + matchTriple[2] + matchTriple[3],
          10,
        );
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
          continue;
        }
      }
      // 3. Fallback
      if (idStr.includes("REQ")) {
        const reqPart = idStr.substring(idStr.lastIndexOf("REQ"));
        const digitsOnly = reqPart.replace(/\D/g, "");
        if (digitsOnly) {
          const num = parseInt(digitsOnly, 10);
          if (!isNaN(num) && num > maxSeq && num < 100000000) {
            maxSeq = num;
          }
        }
      }
    }
  }

  const nextSeq = maxSeq + 1;
  const seqStr = String(nextSeq).padStart(8, "0");
  const block1 = seqStr.substring(0, 4);
  const block2 = seqStr.substring(4, 8);

  return `${cleanSystemId}-REQ-${block1}-${block2}`;
}

function getCreatedDateYMD(d: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Phnom_Penh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
}

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

export class AttendanceRequestsService {
  /**
   * Evaluates conditions, creates attendance request, persists to DB, and sends Telegram alert.
   */
  async createRequest(
    payload: CreateAttendanceRequestPayload,
  ): Promise<{ success: boolean; rule: AttendanceRequestRuleItemDto }> {
    const {
      userId,
      fromDate,
      fromTime,
      toDate,
      toTime,
      subject,
      remark,
      image,
    } = payload;

    if (!userId) {
      throw new Error("User ID is required to submit attendance request.");
    }

    if (!subject || !subject.trim()) {
      throw new Error("Request subject is required.");
    }

    // ── Condition: Date Validation (fromDate <= toDate) ──
    if (fromDate && toDate && fromDate > toDate) {
      throw new Error(
        `Invalid date range: 'from date' (${fromDate}) cannot be greater than 'to date' (${toDate}).`,
      );
    }

    // 1. Fetch User from Database
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ systemId: userId }, { id: userId }],
      },
      include: {
        details: { include: { company: true } },
      },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} was not found.`);
    }

    // 2. Fetch existing rules and DB records to determine next unique sequential ID for this user
    const userSystemId = user.systemId || user.id;
    let existingRules = parseJsonField((user as any).request_attendance_rules);
    let existingDb: { id: string }[] = [];
    try {
      existingDb = await prisma.attendanceRequest.findMany({
        where: {
          userId: userSystemId,
        },
        select: { id: true },
        take: 500,
      });
    } catch {}
    try {
      const d1Requests = await d1Client.query<{ id: string }>(
        "SELECT id FROM AttendanceRequest WHERE userId = ? LIMIT 500",
        [userSystemId],
      );
      if (d1Requests && Array.isArray(d1Requests)) {
        existingDb = [...existingDb, ...d1Requests];
      }
    } catch {}
    const newRuleId = generateNextRequestId(
      userSystemId,
      existingRules,
      existingDb,
    );

    // ── 3. Upload Proof Image to Cloudflare R2 under "staff-attendance-request/" ──
    let storedImageUrl: string | undefined = undefined;
    let imageBuffer: Buffer | null = null;
    let imageMimeType = "image/jpeg";

    if (image && typeof image === "string" && image.trim()) {
      try {
        const rawImg = image.trim();
        let buffer: Buffer | null = null;
        let ext = "jpg";
        let mimeType = "image/jpeg";

        if (rawImg.includes(";base64,")) {
          const parts = rawImg.split(";base64,");
          const header = parts[0].toLowerCase();
          const cleanB64 = parts[1].replace(/\s+/g, "");
          if (header.includes("png")) {
            ext = "png";
            mimeType = "image/png";
          } else if (header.includes("webp")) {
            ext = "webp";
            mimeType = "image/webp";
          } else {
            ext = "jpg";
            mimeType = "image/jpeg";
          }
          buffer = Buffer.from(cleanB64, "base64");
        } else if (
          rawImg.startsWith("http://") ||
          rawImg.startsWith("https://")
        ) {
          storedImageUrl = rawImg;
        } else {
          // Plain base64 without data URI header
          const cleanB64 = rawImg.replace(/\s+/g, "");
          if (cleanB64.length > 50) {
            buffer = Buffer.from(cleanB64, "base64");
            ext = "jpg";
            mimeType = "image/jpeg";
          }
        }

        if (buffer && buffer.length > 0) {
          imageBuffer = buffer;
          imageMimeType = mimeType;
          // Key format: staff-attendance-request/{system_id_or_userId}/{current_created_date}/{timestamp}.ext
          const createdDateStr = getCreatedDateYMD(new Date());
          const userFolder = user.systemId || user.id;
          const fileName = `${Date.now()}_proof.${ext}`;
          const r2Key = `staff-attendance-request/${userFolder}/${createdDateStr}/${fileName}`;
          storedImageUrl = await r2Storage.uploadFile(r2Key, buffer, mimeType);
          console.log(
            `[AttendanceRequest] Stored proof image in Cloudflare R2: ${storedImageUrl}`,
          );
        }
      } catch (err: any) {
        console.warn(
          "[AttendanceRequest] Cloudflare R2 proof image upload failed:",
          err?.message,
        );
      }
    }

    const now = new Date();
    const newRule: AttendanceRequestRuleItemDto = {
      id: newRuleId,
      staff_id: user.id,
      name: user.details?.name || user.username || "Staff Member",
      position: user.details?.position || "Staff",
      date: fromDate,
      time: fromTime,
      from_date: fromDate,
      from_time: fromTime,
      to_date: toDate,
      to_time: toTime,
      subject: subject.trim(),
      remark: (remark || "").trim(),
      image: storedImageUrl || image || undefined,
      status: "pending",
      created_at: now.toISOString(),
    };

    // 4. Persist to Database (AttendanceRequest table)
    try {
      await prisma.attendanceRequest.upsert({
        where: { id: newRuleId },
        update: {
          subject: subject.trim(),
          remark: remark.trim(),
          fromDate: fromDate,
          fromTime: fromTime,
          toDate: toDate,
          toTime: toTime,
        },
        create: {
          id: newRuleId,
          userId: user.systemId || user.id,
          subject: subject.trim(),
          remark: remark.trim(),
          status: "pending",
          fromDate: fromDate,
          fromTime: fromTime,
          toDate: toDate,
          toTime: toTime,
          createdAt: now,
        },
      });
    } catch (e: any) {
      console.warn("Could not insert to AttendanceRequest table:", e?.message);
    }

    // 5. Also sync to Cloudflare D1 AttendanceRequest table
    try {
      await d1Client.execute(
        `INSERT INTO AttendanceRequest (id, userId, subject, remark, status, fromDate, fromTime, toDate, toTime, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           subject = excluded.subject,
           remark = excluded.remark,
           status = excluded.status,
           fromDate = excluded.fromDate,
           fromTime = excluded.fromTime,
           toDate = excluded.toDate,
           toTime = excluded.toTime`,
        [
          newRuleId,
          user.systemId || user.id,
          subject.trim(),
          remark ? remark.trim() : null,
          "pending",
          fromDate,
          fromTime,
          toDate,
          toTime,
          now.toISOString(),
        ],
      );
      console.log(
        `[AttendanceRequest] Synced to Cloudflare D1 AttendanceRequest table: ${newRuleId}`,
      );
    } catch (d1Err: any) {
      console.warn(
        "Could not sync to D1 AttendanceRequest table:",
        d1Err?.message,
      );
    }

    // 6. Update legacy request_attendance_rules JSON column
    const updatedRules = [newRule, ...existingRules];
    try {
      await prisma.$executeRawUnsafe(
        "UPDATE ssh_group_staff_users SET request_attendance_rules = ? WHERE id = ?",
        JSON.stringify(updatedRules),
        user.id,
      );
    } catch {}

    // 7. Dispatch Telegram Notification to Company Group
    const company =
      user.details?.company ||
      (await prisma.company.findFirst({
        where: user.details?.companyId
          ? { id: user.details.companyId }
          : undefined,
        orderBy: { id: "asc" },
      }));

    if (company) {
      this.sendTelegramAlert(
        company,
        newRule,
        imageBuffer,
        imageMimeType,
      ).catch((err) =>
        console.warn(
          "[Telegram Alert] Failed to dispatch alert:",
          err?.message,
        ),
      );
    }

    return {
      success: true,
      rule: newRule,
    };
  }

  private async sendTelegramAlert(
    company: any,
    rule: AttendanceRequestRuleItemDto,
    imageBuffer?: Buffer | null,
    imageMimeType: string = "image/jpeg",
  ): Promise<void> {
    const rawTokens = parseJsonField(company.telegramBotToken);
    const rawChats = parseJsonField(company.telegramChatId);
    const botToken = rawTokens[0];
    if (!botToken || rawChats.length === 0) return;

    const lines = [
      `📝 <b>New Attendance Request Submitted</b>`,
      `🆔 <b>Staff ID:</b> ${rule.staff_id}`,
      `👤 <b>Staff:</b> ${rule.name}`,
      `📌 <b>Subject:</b> ${rule.subject}`,
      `📅 <b>From:</b> ${rule.from_date} ${rule.from_time}`,
      `📅 <b>To:</b> ${rule.to_date} ${rule.to_time}`,
      `💬 <b>Remark:</b> ${rule.remark || "None"}`,
      `⏳ <b>Status:</b> 🟡 PENDING`,
    ];

    if (rule.image || (imageBuffer && imageBuffer.length > 0)) {
      if (
        rule.image &&
        (rule.image.startsWith("http://") ||
          rule.image.startsWith("https://")) &&
        !rule.image.includes("r2.cloudflarestorage.com")
      ) {
        lines.push(
          `📷 <b>Proof Image:</b> <a href="${rule.image}">View Photo</a>`,
        );
      } else {
        lines.push(`📷 <b>Proof Image:</b> [Photo Attached]`);
      }
    }

    const message = lines.join("\n");

    const normalizeChat = (id: string | number): string => {
      const s = String(id).trim();
      if (s === "-5567020132") return "-1004319410551";
      return s;
    };

    for (const rawChat of rawChats) {
      if (!rawChat) continue;
      let chatId = normalizeChat(rawChat);
      try {
        let sentPhoto = false;
        let directBuffer = imageBuffer;
        let mime = imageMimeType || "image/jpeg";

        if (!directBuffer && rule.image) {
          const rawImg = rule.image.trim();
          if (rawImg.includes(";base64,")) {
            const parts = rawImg.split(";base64,");
            mime = parts[0].includes("png") ? "image/png" : "image/jpeg";
            directBuffer = Buffer.from(parts[1].replace(/\s+/g, ""), "base64");
          } else if (/^[A-Za-z0-9+/=]+$/.test(rawImg.slice(0, 100))) {
            directBuffer = Buffer.from(rawImg.replace(/\s+/g, ""), "base64");
          }
        }

        // Send photo multipart via FormData (identical to Attendance Scan Alert)
        if (directBuffer && directBuffer.length > 0) {
          try {
            console.log(
              `[Telegram] Sending attendance request photo (${directBuffer.length} bytes) to chatId ${chatId}...`,
            );
            const blob = new Blob([new Uint8Array(directBuffer)], {
              type: mime,
            });
            const formData = new FormData();
            formData.append("chat_id", chatId);
            formData.append("caption", message);
            formData.append("parse_mode", "HTML");
            formData.append(
              "photo",
              blob,
              mime.includes("png") ? "proof.png" : "proof.jpg",
            );

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
                `[Telegram] ✅ Attendance request photo alert delivered to chatId ${chatId}`,
              );
            } else {
              const errBody = await photoRes.text();
              console.warn(
                `[Telegram sendPhoto failed] Status ${photoRes.status}:`,
                errBody,
              );
            }
          } catch (photoErr) {
            console.warn(
              "[Telegram] Error sending attendance request photo multipart:",
              photoErr,
            );
          }
        } else if (
          rule.image &&
          (rule.image.startsWith("http://") ||
            rule.image.startsWith("https://")) &&
          !rule.image.includes("r2.cloudflarestorage.com")
        ) {
          try {
            const photoRes = await fetch(
              `https://api.telegram.org/bot${botToken}/sendPhoto`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: chatId,
                  photo: rule.image,
                  caption: message,
                  parse_mode: "HTML",
                }),
              },
            );

            if (photoRes.ok) {
              sentPhoto = true;
              console.log(
                `[Telegram] ✅ Attendance request photo URL sent to chatId ${chatId}`,
              );
            } else {
              const errBody = await photoRes.text();
              console.warn(
                `[Telegram sendPhoto failed] Status ${photoRes.status}:`,
                errBody,
              );
            }
          } catch (photoErr) {
            console.warn("[Telegram] Error sending photo URL:", photoErr);
          }
        }

        // If photo was successfully sent with caption, skip duplicate text message
        if (sentPhoto) continue;

        const sendRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "HTML",
          }),
        });

        if (!sendRes.ok) {
          const resJson: any = await sendRes.json().catch(() => null);
          if (resJson?.parameters?.migrate_to_chat_id) {
            const newChatId = String(resJson.parameters.migrate_to_chat_id);
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: newChatId,
                text: message,
                parse_mode: "HTML",
              }),
            });
          }
        }
      } catch (err: any) {
        console.warn(
          `[Telegram Alert] Failed to send message to ${chatId}:`,
          err?.message,
        );
      }
    }
  }
}

export const attendanceRequestsService = new AttendanceRequestsService();
