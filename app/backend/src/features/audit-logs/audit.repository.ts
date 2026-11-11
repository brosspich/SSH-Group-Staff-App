import { AuditLog } from "@prisma/client";
import { Logger } from "../../core/utils/logger.js";
import { d1Client } from "../../infrastructure/database/d1Client.js";
import { prisma } from "../../infrastructure/database/prisma.js";

export interface AuditLogFilter {
  action?: string;
  actorId?: string;
  companyId?: string;
  limit?: number;
  offset?: number;
}

export class AuditRepository {
  constructor(private readonly db = prisma) {}

  async findLogs(filter: AuditLogFilter = {}): Promise<AuditLog[]> {
    const { action, actorId, companyId, limit = 50, offset = 0 } = filter;

    const where: any = {
      ...(action ? { action } : {}),
      ...(actorId ? { actorId } : {}),
    };

    if (companyId) {
      where.OR = [
        { actorId: { startsWith: companyId } },
        { targetId: { startsWith: companyId } },
        { details: { contains: companyId } },
      ];
    }

    let logs = await this.db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    // Remote Cloudflare D1 fallback
    if (logs.length === 0) {
      try {
        let sql = "SELECT * FROM AuditLog";
        const conditions: string[] = [];
        const params: any[] = [];

        if (action) {
          conditions.push("action = ?");
          params.push(action);
        }
        if (actorId) {
          conditions.push("actorId = ?");
          params.push(actorId);
        }
        if (companyId) {
          conditions.push(
            "(actorId LIKE ? OR targetId LIKE ? OR details LIKE ?)",
          );
          params.push(`${companyId}%`, `${companyId}%`, `%${companyId}%`);
        }

        if (conditions.length > 0) {
          sql += " WHERE " + conditions.join(" AND ");
        }
        sql += " ORDER BY timestamp DESC LIMIT ? OFFSET ?;";
        params.push(limit, offset);

        const d1Logs = await d1Client.query<any>(sql, params);
        if (d1Logs && d1Logs.length > 0) {
          logs = d1Logs.map((l: any) => ({
            id: l.id,
            action: l.action,
            actorId: l.actorId,
            actorName: l.actorName,
            targetId: l.targetId,
            details: l.details,
            ipAddress: l.ipAddress,
            createdAt: new Date(l.timestamp || l.createdAt || Date.now()),
          }));
        }
      } catch (err: any) {
        Logger.warn(`[Cloudflare D1] AuditLog query error: ${err?.message}`);
      }
    }

    return logs;
  }

  async findById(id: string): Promise<AuditLog | null> {
    const local = await this.db.auditLog.findUnique({
      where: { id },
    });
    if (local) return local;

    try {
      const d1Log = await d1Client.queryFirst<any>(
        "SELECT * FROM AuditLog WHERE id = ? LIMIT 1;",
        [id],
      );
      if (d1Log) {
        return {
          id: d1Log.id,
          action: d1Log.action,
          actorId: d1Log.actorId,
          actorName: d1Log.actorName,
          targetId: d1Log.targetId,
          details: d1Log.details,
          ipAddress: d1Log.ipAddress,
          createdAt: new Date(d1Log.timestamp || d1Log.createdAt || Date.now()),
        };
      }
    } catch {}

    return null;
  }
}

export const auditRepository = new AuditRepository();
