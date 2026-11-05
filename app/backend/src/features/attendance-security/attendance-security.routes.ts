import { Router } from "express";
import { attendanceSecurityController } from "./attendance-security.controller.js";

const router = Router();

router.post("/verify", (req, res) =>
  attendanceSecurityController.verifySecurity(req, res),
);
router.get("/verify", (req, res) =>
  attendanceSecurityController.verifySecurity(req, res),
);

router.post("/scan", (req, res) =>
  attendanceSecurityController.processScan(req, res),
);

router.post("/confirm", (req, res) =>
  attendanceSecurityController.confirmAttendance(req, res),
);
router.post("/submit", (req, res) =>
  attendanceSecurityController.confirmAttendance(req, res),
);

export const attendanceSecurityRoutes = router;
