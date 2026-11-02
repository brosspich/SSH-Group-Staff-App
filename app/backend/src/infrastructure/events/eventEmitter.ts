import { EventEmitter } from "events";
import {
  AuditEvent,
  IAuditLogger,
} from "../../core/interfaces/audit.interface.js";
import { Logger } from "../../core/utils/logger.js";
import { prisma } from "../database/prisma.js";

export const domainEvents = new EventEmitter();

export class DatabaseAuditLogger implements IAuditLogger {
  async log(event: AuditEvent): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: event.action,
          actorId: event.actorId,
          actorName: event.actorName,
          targetId: event.targetId,
          details: event.details ? JSON.stringify(event.details) : undefined,
          ipAddress: event.ipAddress,
        },
      });
      Logger.info(`Audit logged: ${event.action} by ${event.actorName}`);
    } catch (err) {
      Logger.error("Failed to persist audit log to database", err);
    }
  }
}

export const auditLogger = new DatabaseAuditLogger();
