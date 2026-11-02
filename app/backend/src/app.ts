import cors from "cors";
import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { NotFoundError } from "./core/errors/AppError.js";
import { errorHandler } from "./core/middlewares/errorHandler.js";
import { apiRateLimiter } from "./core/middlewares/rateLimiter.js";

import { auditRoutes } from "./features/audit-logs/index.js";
import { authRoutes } from "./features/auth/index.js";
import { companyRoutes } from "./features/company/index.js";
import { d1Routes } from "./features/d1/index.js";
import { keyRoutes } from "./features/keys/index.js";
import { sshGroupRoutes } from "./features/ssh-groups/index.js";
import { usersRoutes } from "./features/users/index.js";

export const createApp = (): Application => {
  const app = express();

  // Security & utility middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(apiRateLimiter);

  // Health check
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "UP",
      timestamp: new Date().toISOString(),
      service: "ssh-group-backend",
    });
  });

  // Feature routes (API v1)
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/company-query", companyRoutes);
  app.use("/api/v1/companies", companyRoutes);
  app.use("/api/v1/users-query", usersRoutes);
  app.use("/api/v1/d1", d1Routes);
  app.use("/api/v1/ssh-groups", sshGroupRoutes);
  app.use("/api/v1/keys", keyRoutes);
  app.use("/api/v1/audit-logs", auditRoutes);

  // Direct route aliases for compatibility
  app.use("/auth", authRoutes);
  app.use("/company-query", companyRoutes);
  app.use("/companies", companyRoutes);
  app.use("/users-query", usersRoutes);
  app.use("/d1", d1Routes);
  app.use("/ssh-groups", sshGroupRoutes);
  app.use("/keys", keyRoutes);
  app.use("/audit-logs", auditRoutes);

  // Fallthrough 404 handler
  app.use((_req: Request, _res: Response, next) => {
    next(new NotFoundError("The requested API route does not exist"));
  });

  // Centralized Error Handler (DRY)
  app.use(errorHandler);

  return app;
};
