import { Router } from "express";
import { authGuard, requireRole } from "../../core/middlewares/authGuard.js";
import { auditController } from "./audit.controller.js";

const router = Router();

router.use(authGuard);
router.use(requireRole(["admin", "manager"]));

router.get("/", auditController.getLogs);
router.get("/:id", auditController.getById);

export const auditRoutes = router;
