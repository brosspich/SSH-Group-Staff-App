export interface CreateAttendanceRequestPayload {
  userId: string;
  fromDate: string;
  fromTime: string;
  toDate: string;
  toTime: string;
  subject: string;
  remark: string;
}

export interface AttendanceRequestRuleItemDto {
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
