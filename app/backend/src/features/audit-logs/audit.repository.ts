import { prisma } from '../../infrastructure/database/prisma.js';
import { AuditLog } from '@prisma/client';

export interface AuditLogFilter {
  action?: string;
  actorId?: string;
  limit?: number;
  offset?: number;
}

export class AuditRepository {
  constructor(private readonly db = prisma) {}

  async findLogs(filter: AuditLogFilter = {}): Promise<AuditLog[]> {
    const { action, actorId, limit = 50, offset = 0 } = filter;
    return await this.db.auditLog.findMany({
      where: {
        ...(action ? { action } : {}),
        ...(actorId ? { actorId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async findById(id: string): Promise<AuditLog | null> {
    return await this.db.auditLog.findUnique({
      where: { id },
    });
  }
}

export const auditRepository = new AuditRepository();
