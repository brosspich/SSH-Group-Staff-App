import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../core/middlewares/authGuard.js';
import { SshGroupService, sshGroupService } from './ssh-group.service.js';

export class SshGroupController {
  constructor(private readonly service: SshGroupService = sshGroupService) {}

  getAll = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const groups = await this.service.getAll();
      return res.status(200).json({ success: true, data: groups });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const group = await this.service.getById(req.params.id);
      return res.status(200).json({ success: true, data: group });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const actorId = req.user!.userId;
      const actorName = req.user!.username;
      const group = await this.service.create(req.body, actorId, actorName);
      return res.status(201).json({ success: true, data: group });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const actorId = req.user!.userId;
      const actorName = req.user!.username;
      const updated = await this.service.update(req.params.id, req.body, actorId, actorName);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const actorId = req.user!.userId;
      const actorName = req.user!.username;
      await this.service.delete(req.params.id, actorId, actorName);
      return res.status(200).json({ success: true, message: 'SSH Group deleted successfully' });
    } catch (err) {
      next(err);
    }
  };
}

export const sshGroupController = new SshGroupController();
