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

export const attendanceSecurityRoutes = router;
