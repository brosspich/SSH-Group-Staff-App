import { Router } from "express";
import { authRateLimiter } from "../../core/middlewares/rateLimiter.js";
import { validateBody } from "../../core/middlewares/validateBody.js";
import { authController } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schema.js";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  validateBody(registerSchema),
  authController.register,
);

router.post(
  "/login",
  authRateLimiter,
  validateBody(loginSchema),
  authController.login,
);

router.post("/logout", authController.logout);

export const authRoutes = router;
