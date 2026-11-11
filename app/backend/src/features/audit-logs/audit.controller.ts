import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../core/middlewares/authGuard.js";
import { AuditService, auditService } from "./audit.service.js";

export class AuditController {
  constructor(private readonly service: AuditService = auditService) {}

  getLogs = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { action, actorId, limit, offset, companyId } = req.query;
      const userSystemId = req.user?.userId || "";
      let resolvedCompanyId =
        (companyId as string) || (req.headers["x-company-id"] as string) || "";

      if (!resolvedCompanyId && userSystemId) {
        const match = userSystemId.match(/^(system-\d+)/i);
        if (match) {
          resolvedCompanyId = match[1].toLowerCase();
        }
      }

      const logs = await this.service.getLogs({
        action: action ? String(action) : undefined,
        actorId: actorId ? String(actorId) : undefined,
        companyId: resolvedCompanyId || undefined,
        limit: limit ? parseInt(String(limit), 10) : undefined,
        offset: offset ? parseInt(String(offset), 10) : undefined,
      });
      return res.status(200).json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  };

  getById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const id = String(req.params.id);
      const log = await this.service.getLogById(id);
      return res.status(200).json({ success: true, data: log });
    } catch (err) {
      next(err);
    }
  };
}

export const auditController = new AuditController();
