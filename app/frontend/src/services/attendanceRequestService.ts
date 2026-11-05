import { apiClient } from "@/services/api";
import { StaffUser, userService } from "@/services/userService";

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
 * Submits an attendance request:
 * 1. Delegates validation & conditions (from_date <= to_date) to Backend.
 * 2. Backend generates sequential ID (REQ-0000-0000-0001).
 * 3. Backend persists to Database and dispatches Telegram notification.
 * 4. Updates local user state.
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

  // Call Backend 70%: Backend performs all conditions and DB operations!
  const res = await apiClient.post<{
    success: boolean;
    rule: AttendanceRequestRuleItem;
  }>("/attendance-requests", {
    userId: user.id,
    fromDate,
    fromTime,
    toDate,
    toTime,
    subject,
    remark,
  });

  const newRule = res?.rule || (res as any)?.data?.rule;

  if (newRule) {
    // Sync local storage
    try {
      let existing: AttendanceRequestRuleItem[] = [];
      if (Array.isArray(user.request_attendance_rules)) {
        existing = user.request_attendance_rules;
      }
      const updatedUser: StaffUser = {
        ...user,
        request_attendance_rules: [newRule, ...existing],
      };
      await userService.save(updatedUser);
    } catch {}
  }

  return { success: true, rule: newRule };
}
