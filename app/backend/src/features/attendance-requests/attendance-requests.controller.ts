import { Request, Response } from "express";
import { attendanceRequestsService } from "./attendance-requests.service.js";

export class AttendanceRequestsController {
  async createRequest(req: Request, res: Response) {
    try {
      const {
        userId,
        staffId,
        fromDate,
        from_date,
        fromTime,
        from_time,
        toDate,
        to_date,
        toTime,
        to_time,
        subject,
        remark,
      } = req.body;

      const effectiveUserId = userId || staffId || (req as any).user?.id;

      const result = await attendanceRequestsService.createRequest({
        userId: effectiveUserId,
        fromDate: fromDate || from_date,
        fromTime: fromTime || from_time || "08:00 AM",
        toDate: toDate || to_date,
        toTime: toTime || to_time || "05:00 PM",
        subject,
        remark,
      });

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: {
          message: err?.message || "Failed to submit attendance request.",
        },
      });
    }
  }
}

export const attendanceRequestsController = new AttendanceRequestsController();
