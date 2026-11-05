import { Router } from "express";
import { attendanceRequestsController } from "./attendance-requests.controller.js";

const router = Router();

router.post("/", (req, res) =>
  attendanceRequestsController.createRequest(req, res),
);

export const attendanceRequestsRoutes = router;
