export interface AuditEvent {
  action: string;
  actorId: string;
  actorName: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  timestamp?: Date;
}

export interface IAuditLogger {
  log(event: AuditEvent): Promise<void>;
}
