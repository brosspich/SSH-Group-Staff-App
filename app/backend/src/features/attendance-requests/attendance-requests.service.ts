import { prisma } from "../../infrastructure/database/prisma.js";
import {
  AttendanceRequestRuleItemDto,
  CreateAttendanceRequestPayload,
} from "./attendance-requests.types.js";

function generateNextRequestId(existingRules: any[] = []): string {
  let maxSeq = 0;
  for (const r of existingRules) {
    if (r?.id && typeof r.id === "string") {
      const clean = r.id.replace(/^req[-_]/i, "").replace(/-/g, "");
      const num = parseInt(clean, 10);
      if (!isNaN(num) && num > maxSeq && num < 1000000000000) {
        maxSeq = num;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  const seqStr = String(nextSeq).padStart(12, "0");
  const block1 = seqStr.substring(0, 4);
  const block2 = seqStr.substring(4, 8);
  const block3 = seqStr.substring(8, 12);

  return `REQ-${block1}-${block2}-${block3}`;
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
    const { userId, fromDate, fromTime, toDate, toTime, subject, remark } =
      payload;

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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} was not found.`);
    }

    // 2. Fetch existing rules to determine next sequential ID
    let existingRules = parseJsonField((user as any).request_attendance_rules);
    const newRuleId = generateNextRequestId(existingRules);

    const now = new Date();
    const newRule: AttendanceRequestRuleItemDto = {
      id: newRuleId,
      staff_id: user.id,
      name: user.name || user.username || "Staff Member",
      position: user.position || "Staff",
      date: fromDate,
      time: fromTime,
      from_date: fromDate,
      from_time: fromTime,
      to_date: toDate,
      to_time: toTime,
      subject: subject.trim(),
      remark: (remark || "").trim(),
      status: "pending",
      created_at: now.toISOString(),
    };

    // 3. Persist to Database (AttendanceRequest table)
    try {
      await prisma.attendanceRequest.create({
        data: {
          id: newRuleId,
          userId: user.id,
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

    // 4. Update legacy request_attendance_rules JSON column
    const updatedRules = [newRule, ...existingRules];
    try {
      await prisma.$executeRawUnsafe(
        "UPDATE ssh_group_staff_users SET request_attendance_rules = ? WHERE id = ?",
        JSON.stringify(updatedRules),
        user.id,
      );
    } catch {}

    // 5. Dispatch Telegram Notification to Company Group
    if (user.company) {
      this.sendTelegramAlert(user.company, newRule).catch(() => {});
    }

    return {
      success: true,
      rule: newRule,
    };
  }

  private async sendTelegramAlert(
    company: any,
    rule: AttendanceRequestRuleItemDto,
  ): Promise<void> {
    const rawTokens = parseJsonField(company.telegramBotToken);
    const rawChats = parseJsonField(company.telegramChatId);
    const botToken = rawTokens[0];
    if (!botToken || rawChats.length === 0) return;

    const message = [
      `📝 <b>New Attendance Request Submitted</b>`,
      `🏢 <b>Company:</b> ${company.name}`,
      `👤 <b>Staff:</b> ${rule.name} (${rule.staff_id})`,
      `📌 <b>Subject:</b> ${rule.subject}`,
      `📅 <b>From:</b> ${rule.from_date} ${rule.from_time}`,
      `📅 <b>To:</b> ${rule.to_date} ${rule.to_time}`,
      `💬 <b>Remark:</b> ${rule.remark || "None"}`,
      `⏳ <b>Status:</b> 🟡 PENDING`,
      `🆔 <b>Request ID:</b> <code>${rule.id}</code>`,
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

export const attendanceRequestsService = new AttendanceRequestsService();
