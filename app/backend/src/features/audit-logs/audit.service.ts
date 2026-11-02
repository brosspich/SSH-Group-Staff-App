import { AuditRepository, auditRepository, AuditLogFilter } from './audit.repository.js';
import { NotFoundError } from '../../core/errors/AppError.js';

export class AuditService {
  constructor(private readonly repo: AuditRepository = auditRepository) {}

  async getLogs(filter: AuditLogFilter) {
    return await this.repo.findLogs(filter);
  }

  async getLogById(id: string) {
    const log = await this.repo.findById(id);
    if (!log) {
      throw new NotFoundError('Audit log record not found');
    }
    return log;
  }
}

export const auditService = new AuditService();
