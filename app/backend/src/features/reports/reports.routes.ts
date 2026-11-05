import { Router } from "express";
import { reportsController } from "./reports.controller.js";

const router = Router();

router.get("/attendance", (req, res) =>
  reportsController.getAttendanceReport(req, res),
);
router.get("/requests", (req, res) =>
  reportsController.getRequestReport(req, res),
);

export const reportsRoutes = router;
