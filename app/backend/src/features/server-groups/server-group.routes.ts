import { Router } from "express";
import { authGuard, requireRole } from "../../core/middlewares/authGuard.js";
import { validateBody } from "../../core/middlewares/validateBody.js";
import { serverGroupController } from "./server-group.controller.js";
import {
  createServerGroupSchema,
  updateServerGroupSchema,
} from "./server-group.schema.js";

const router = Router();

router.use(authGuard);

router.get("/", serverGroupController.getAll);
router.get("/:id", serverGroupController.getById);
router.post(
  "/",
  requireRole(["admin", "manager", "owner"]),
  validateBody(createServerGroupSchema),
  serverGroupController.create,
);
router.put(
  "/:id",
  requireRole(["admin", "manager", "owner"]),
  validateBody(updateServerGroupSchema),
  serverGroupController.update,
);
router.delete(
  "/:id",
  requireRole(["admin", "owner"]),
  serverGroupController.delete,
);

export const serverGroupRoutes = router;

// Backwards-compatible alias
export const sshGroupRoutes = router;
