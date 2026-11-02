import { sendAttendanceRequestToTelegram } from "@/services/telegramService";
import { StaffUser, userService } from "@/services/userService";
import { supabase } from "@/utils/supabase";

export interface AttendanceRequestRuleItem {
  id: string;
  staff_id: string;
  name: string;
  position: string;
  date: string;
  time: string;
  from_date: string;
  from_time: string;
  to_date: string;
  to_time: string;
  subject: string;
  remark: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

/**
 * Generates the next sequential request ID formatted as REQ-0000-0000-0001
 */
export function generateNextRequestId(existingRules: any[] = []): string {
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

/**
 * Submits an attendance request:
 * 1. Saves directly into Supabase table `ssh_group_staff_users` in `request_attendance_rules` JSONB column.
 * 2. Updates local user storage in AsyncStorage.
 * 3. Sends notification to all active Telegram groups.
 */
export async function submitAttendanceRequest(params: {
  user: StaffUser;
  fromDate: string;
  fromTime: string;
  toDate: string;
  toTime: string;
  subject: string;
  remark: string;
}): Promise<{ success: boolean; rule: AttendanceRequestRuleItem }> {
  const { user, fromDate, fromTime, toDate, toTime, subject, remark } = params;

  if (!user?.id) {
    throw new Error("User information is missing. Please log in again.");
  }

  // 1. Fetch current request_attendance_rules from Supabase
  let existingRules: any[] = [];
  try {
    const { data: dbUser, error: fetchErr } = await supabase
      .from("ssh_group_staff_users")
      .select("request_attendance_rules")
      .eq("id", user.id)
      .maybeSingle();

    if (!fetchErr && dbUser) {
      const raw = dbUser.request_attendance_rules;
      if (Array.isArray(raw)) {
        existingRules = raw;
      } else if (typeof raw === "string") {
        try {
          existingRules = JSON.parse(raw);
        } catch {}
      }
    } else if (Array.isArray(user.request_attendance_rules)) {
      existingRules = user.request_attendance_rules;
    }
  } catch {
    if (Array.isArray(user.request_attendance_rules)) {
      existingRules = user.request_attendance_rules;
    }
  }

  // 2. Generate new rule item
  const newRuleId = generateNextRequestId(existingRules);
  const newRule: AttendanceRequestRuleItem = {
    id: newRuleId,
    staff_id: user.id,
    name: user.name || "N/A",
    position: user.position || "Staff",
    date: fromDate,
    time: fromTime,
    from_date: fromDate,
    from_time: fromTime,
    to_date: toDate,
    to_time: toTime,
    subject: subject.trim(),
    remark: remark.trim(),
    status: "pending",
    created_at: new Date().toISOString(),
  };

  const updatedRules = [newRule, ...existingRules];

  // 3. Save directly to Supabase table ssh_group_staff_users
  const { error: updateError } = await supabase
    .from("ssh_group_staff_users")
    .update({ request_attendance_rules: updatedRules })
    .eq("id", user.id);

  if (updateError) {
    console.error(
      "Failed to save request_attendance_rules to Supabase:",
      updateError,
    );
    throw new Error(
      updateError.message || "Failed to save request to database.",
    );
  }

  // 4. Update local user storage in AsyncStorage
  try {
    const updatedUser: StaffUser = {
      ...user,
      request_attendance_rules: updatedRules,
    };
    await userService.save(updatedUser);
  } catch (err) {
    console.warn("Failed to update local AsyncStorage user cache:", err);
  }

  // 5. Send notification to Telegram
  try {
    await sendAttendanceRequestToTelegram({
      requestId: newRuleId,
      staffId: user.id,
      systemId: user.system_id,
      name: user.name || "N/A",
      position: user.position || "Staff",
      subject: subject.trim(),
      remark: remark.trim(),
      date: fromDate,
      time: fromTime,
      fromDate: fromDate,
      fromTime: fromTime,
      toDate: toDate,
      toTime: toTime,
    });
  } catch (tgErr) {
    console.warn("Failed to send attendance request to Telegram:", tgErr);
  }

  return { success: true, rule: newRule };
}
