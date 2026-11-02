export type AuditActionType =
  | "SSH_GROUP_CREATED"
  | "SSH_GROUP_UPDATED"
  | "SSH_GROUP_DELETED"
  | "KEY_UPLOADED"
  | "KEY_REVOKED"
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "ATTENDANCE_CHECKIN"
  | "ATTENDANCE_CHECKOUT";

export interface AuditLog {
  id: string;
  action: AuditActionType;
  actorId: string;
  actorName: string;
  targetId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditFilterParams {
  action?: AuditActionType;
  actorId?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}
