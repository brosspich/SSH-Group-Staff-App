import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../core/middlewares/authGuard.js';
import { AuditService, auditService } from './audit.service.js';

export class AuditController {
  constructor(private readonly service: AuditService = auditService) {}

  getLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { action, actorId, limit, offset } = req.query;
      const logs = await this.service.getLogs({
        action: action ? String(action) : undefined,
        actorId: actorId ? String(actorId) : undefined,
        limit: limit ? parseInt(String(limit), 10) : undefined,
        offset: offset ? parseInt(String(offset), 10) : undefined,
      });
      return res.status(200).json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const log = await this.service.getLogById(req.params.id);
      return res.status(200).json({ success: true, data: log });
    } catch (err) {
      next(err);
    }
  };
}

export const auditController = new AuditController();
