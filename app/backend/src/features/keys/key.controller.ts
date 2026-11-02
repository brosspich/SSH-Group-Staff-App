import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../core/middlewares/authGuard.js";
import { KeyService, keyService } from "./key.service.js";

export class KeyController {
  constructor(private readonly service: KeyService = keyService) {}

  getMyKeys = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const keys = await this.service.getUserKeys(req.user!.userId);
      return res.status(200).json({ success: true, data: keys });
    } catch (err) {
      next(err);
    }
  };

  uploadKey = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { userId, username } = req.user!;
      const key = await this.service.uploadKey(
        userId,
        username,
        req.body,
        req.ip,
      );
      return res.status(201).json({ success: true, data: key });
    } catch (err) {
      next(err);
    }
  };

  revokeKey = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { userId, username, role } = req.user!;
      const keyId = String(req.params.id);
      await this.service.revokeKey(keyId, userId, username, role, req.ip);
      return res
        .status(200)
        .json({ success: true, message: "SSH Key revoked successfully" });
    } catch (err) {
      next(err);
    }
  };
}

export const keyController = new KeyController();
