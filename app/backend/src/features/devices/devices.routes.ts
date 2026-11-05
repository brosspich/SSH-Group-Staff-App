import { Router } from "express";
import { devicesController } from "./devices.controller.js";

const router = Router();

router.get("/", (req, res) => devicesController.getSessions(req, res));
router.post("/sync", (req, res) => devicesController.syncSession(req, res));
router.post("/terminate-others", (req, res) =>
  devicesController.terminateOtherSessions(req, res),
);
router.post("/auto-terminate-inactive", (req, res) =>
  devicesController.autoTerminateInactive(req, res),
);
router.post("/:id/terminate", (req, res) =>
  devicesController.terminateSession(req, res),
);

export const devicesRoutes = router;
