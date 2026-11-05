import { Request, Response } from "express";
import { devicesService } from "./devices.service.js";

export class DevicesController {
  async getSessions(req: Request, res: Response) {
    try {
      const userId = (req.query.userId as string) || (req as any).user?.id;
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: { message: "userId is required to query device sessions." },
        });
      }

      const sessions = await devicesService.getUserSessions(userId);
      return res.status(200).json({
        success: true,
        data: sessions,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || "Failed to fetch device sessions." },
      });
    }
  }

  async syncSession(req: Request, res: Response) {
    try {
      const clientIp =
        (req.headers["cf-connecting-ip"] as string) ||
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket.remoteAddress;

      const session = await devicesService.syncDevice(req.body, clientIp);
      return res.status(200).json({
        success: true,
        data: session,
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: { message: err?.message || "Failed to sync device session." },
      });
    }
  }

  async terminateSession(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const success = await devicesService.terminateSession(id);
      return res.status(200).json({
        success,
        data: { terminated: success },
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || "Failed to terminate session." },
      });
    }
  }

  async terminateOtherSessions(req: Request, res: Response) {
    try {
      const { userId, currentSessionId } = req.body;
      const count = await devicesService.terminateOtherSessions(
        userId,
        currentSessionId,
      );
      return res.status(200).json({
        success: true,
        data: { terminatedCount: count },
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: {
          message: err?.message || "Failed to terminate other sessions.",
        },
      });
    }
  }
}

export const devicesController = new DevicesController();
