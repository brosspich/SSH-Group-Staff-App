import { Request, Response } from "express";
import { attendanceSecurityService } from "./attendance-security.service.js";
import {
  ProcessScanPayload,
  VerifySecurityPayload,
} from "./attendance-security.types.js";

export class AttendanceSecurityController {
  async verifySecurity(req: Request, res: Response) {
    try {
      const payload: VerifySecurityPayload = {
        systemId: req.body.systemId || (req.query.systemId as string),
        companyId: req.body.companyId || (req.query.companyId as string),
        latitude: parseFloat(req.body.latitude ?? req.query.latitude),
        longitude: parseFloat(req.body.longitude ?? req.query.longitude),
        isMocked: Boolean(req.body.isMocked ?? req.query.isMocked),
        ipAddress: req.body.ipAddress || (req.query.ipAddress as string),
      };

      if (isNaN(payload.latitude) || isNaN(payload.longitude)) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Valid latitude and longitude coordinates are required.",
          },
        });
      }

      const clientIp =
        (req.headers["cf-connecting-ip"] as string) ||
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket.remoteAddress;

      const result = await attendanceSecurityService.verifySecurity(
        payload,
        clientIp,
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: {
          message:
            err?.message ||
            "Internal server error verifying attendance security.",
        },
      });
    }
  }

  async processScan(req: Request, res: Response) {
    try {
      const {
        userId,
        qrData,
        systemId,
        companyId,
        latitude,
        longitude,
        isMocked,
        ipAddress,
        previewOnly,
      } = req.body;

      if (!userId || !qrData) {
        return res.status(400).json({
          success: false,
          error: {
            message: "userId and qrData are required.",
          },
        });
      }

      const payload: ProcessScanPayload = {
        userId,
        qrData,
        systemId,
        companyId,
        latitude: typeof latitude === "number" ? latitude : undefined,
        longitude: typeof longitude === "number" ? longitude : undefined,
        isMocked: Boolean(isMocked),
        ipAddress,
        previewOnly: Boolean(previewOnly),
      };

      const clientIp =
        (req.headers["cf-connecting-ip"] as string) ||
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket.remoteAddress;

      const result = await attendanceSecurityService.processAttendanceScan(
        payload,
        clientIp,
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: {
          message:
            err?.message || "Internal server error processing attendance scan.",
        },
      });
    }
  }

  async confirmAttendance(req: Request, res: Response) {
    try {
      const { userId, qrData, date, time, type, timestamp, name } = req.body;

      if (!userId || !qrData) {
        return res.status(400).json({
          success: false,
          error: {
            message: "userId and qrData are required to confirm attendance.",
          },
        });
      }

      const clientIp =
        (req.headers["cf-connecting-ip"] as string) ||
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket.remoteAddress;

      const result = await attendanceSecurityService.confirmAttendance(
        req.body,
        clientIp,
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: {
          message:
            err?.message || "Internal server error confirming attendance.",
        },
      });
    }
  }
}

export const attendanceSecurityController = new AttendanceSecurityController();
