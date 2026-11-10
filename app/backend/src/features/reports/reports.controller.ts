import { Request, Response } from "express";
import { reportsService } from "./reports.service.js";
import { ReportMode, ReportType } from "./reports.types.js";

export class ReportsController {
  async getAttendanceReport(req: Request, res: Response) {
    try {
      const mode = (req.query.mode as ReportMode) || "all";
      const type = (req.query.type as ReportType) || "Daily";
      const dateStr = req.query.date as string | undefined;
      const staffId = req.query.staffId as string | undefined;
      const companyId =
        (req.query.companyId as string) ||
        (req.headers["x-company-id"] as string) ||
        undefined;
      const currentUserId =
        (req as any).user?.id ||
        (req.headers["x-staff-system-id"] as string) ||
        (req.headers["x-staff-id"] as string) ||
        (req.query.currentUserId as string);

      const result = await reportsService.getAttendanceReport({
        mode,
        type,
        dateStr,
        staffId,
        companyId,
        currentUserId,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: {
          message: err?.message || "Failed to generate attendance report.",
        },
      });
    }
  }

  async getRequestReport(req: Request, res: Response) {
    try {
      const mode = (req.query.mode as ReportMode) || "all";
      const type = (req.query.type as ReportType) || "Daily";
      const dateStr = req.query.date as string | undefined;
      const staffId = req.query.staffId as string | undefined;
      const companyId =
        (req.query.companyId as string) ||
        (req.headers["x-company-id"] as string) ||
        undefined;
      const currentUserId =
        (req as any).user?.id ||
        (req.headers["x-staff-system-id"] as string) ||
        (req.headers["x-staff-id"] as string) ||
        (req.query.currentUserId as string);

      const result = await reportsService.getRequestReport({
        mode,
        type,
        dateStr,
        staffId,
        companyId,
        currentUserId,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: {
          message: err?.message || "Failed to generate request report.",
        },
      });
    }
  }
}

export const reportsController = new ReportsController();
