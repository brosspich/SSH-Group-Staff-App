import { EventEmitter } from "events";
import {
  AuditEvent,
  IAuditLogger,
} from "../../core/interfaces/audit.interface.js";
import { Logger } from "../../core/utils/logger.js";
import { d1Client } from "../database/d1Client.js";
import { prisma } from "../database/prisma.js";

export const domainEvents = new EventEmitter();

async function generateNextAuditId(): Promise<string> {
  let maxSeq = 0;

  try {
    const logs = await prisma.auditLog.findMany({
      select: { id: true },
    });
    for (const l of logs) {
      if (!l.id) continue;
      const match = l.id.match(/audit-(\d{4})-(\d{4})-(\d{4})/i);
      if (match) {
        const num = parseInt(match[1] + match[2] + match[3], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
  } catch {}

  try {
    const d1Logs = await d1Client.query<{ id: string }>(
      "SELECT id FROM AuditLog WHERE id LIKE 'audit-%';",
    );
    for (const l of d1Logs) {
      if (!l.id) continue;
      const match = l.id.match(/audit-(\d{4})-(\d{4})-(\d{4})/i);
      if (match) {
        const num = parseInt(match[1] + match[2] + match[3], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
  } catch {}

  const nextSeq = maxSeq + 1;
  const seqStr = String(nextSeq).padStart(12, "0");
  const b1 = seqStr.substring(0, 4);
  const b2 = seqStr.substring(4, 8);
  const b3 = seqStr.substring(8, 12);

  return `audit-${b1}-${b2}-${b3}`;
}

export class DatabaseAuditLogger implements IAuditLogger {
  async log(event: AuditEvent): Promise<void> {
    try {
      const auditId = await generateNextAuditId();
      const detailsStr = event.details
        ? typeof event.details === "string"
          ? event.details
          : JSON.stringify(event.details)
        : undefined;
      const now = event.timestamp || new Date();

      // 1. Save to local SQLite database
      await prisma.auditLog.create({
        data: {
          id: auditId,
          action: event.action,
          actorId: event.actorId,
          actorName: event.actorName,
          targetId: event.targetId,
          details: detailsStr,
          ipAddress: event.ipAddress,
          createdAt: now,
        },
      });

      // 2. Save directly to Cloudflare D1 AuditLog table
      try {
        await d1Client.execute(
          `INSERT INTO AuditLog (id, action, actorId, actorName, targetId, details, ipAddress, timestamp)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             action = excluded.action,
             actorId = excluded.actorId,
             actorName = excluded.actorName,
             targetId = excluded.targetId,
             details = excluded.details,
             ipAddress = excluded.ipAddress,
             timestamp = excluded.timestamp;`,
          [
            auditId,
            event.action,
            event.actorId,
            event.actorName,
            event.targetId || null,
            detailsStr || null,
            event.ipAddress || null,
            now.toISOString(),
          ],
        );
        Logger.info(
          `[Cloudflare D1] ✓ Synced AuditLog ${auditId} (${event.action})`,
        );
      } catch (d1Err: any) {
        Logger.warn(
          `[Cloudflare D1] Failed to sync AuditLog ${auditId}: ${d1Err?.message}`,
        );
      }

      Logger.info(
        `Audit logged: ${auditId} - ${event.action} by ${event.actorName}`,
      );
    } catch (err) {
      Logger.error("Failed to persist audit log to database", err);
    }
  }
}

export const auditLogger = new DatabaseAuditLogger();
