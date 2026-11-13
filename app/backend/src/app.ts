import cors from "cors";
import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { NotFoundError } from "./core/errors/AppError.js";
import { errorHandler } from "./core/middlewares/errorHandler.js";
import { apiRateLimiter } from "./core/middlewares/rateLimiter.js";
import { Logger } from "./core/utils/logger.js";

import { attendanceRequestsRoutes } from "./features/attendance-requests/index.js";
import { attendanceSecurityRoutes } from "./features/attendance-security/index.js";
import { auditRoutes } from "./features/audit-logs/index.js";
import { authRoutes } from "./features/auth/index.js";
import { companyRoutes } from "./features/company/index.js";
import { d1Routes } from "./features/d1/index.js";
import { devicesRoutes } from "./features/devices/index.js";
import { keyRoutes } from "./features/keys/index.js";
import { reportsRoutes } from "./features/reports/index.js";
import { serverGroupRoutes } from "./features/server-groups/index.js";
import { subscriptionRoutes } from "./features/subscription/index.js";
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
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Live HTTP request logger
  app.use((req: Request, res: Response, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      Logger.info(
        `[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`,
      );
    });
    next();
  });

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
  app.use("/api/v1/attendance-security", attendanceSecurityRoutes);
  app.use("/api/v1/attendance-requests", attendanceRequestsRoutes);
  app.use("/api/v1/devices", devicesRoutes);
  app.use("/api/v1/company-query", companyRoutes);
  app.use("/api/v1/companies", companyRoutes);
  app.use("/api/v1/users-query", usersRoutes);
  app.use("/api/v1/d1", d1Routes);
  app.use("/api/v1/server-groups", serverGroupRoutes);
  app.use("/api/v1/keys", keyRoutes);
  app.use("/api/v1/audit-logs", auditRoutes);
  app.use("/api/v1/reports", reportsRoutes);
  app.use("/api/v1/subscription", subscriptionRoutes);

  // Direct route aliases for compatibility
  app.use("/auth", authRoutes);
  app.use("/attendance-security", attendanceSecurityRoutes);
  app.use("/attendance-requests", attendanceRequestsRoutes);
  app.use("/devices", devicesRoutes);
  app.use("/company-query", companyRoutes);
  app.use("/companies", companyRoutes);
  app.use("/users-query", usersRoutes);
  app.use("/d1", d1Routes);
  app.use("/server-groups", serverGroupRoutes);
  app.use("/keys", keyRoutes);
  app.use("/audit-logs", auditRoutes);
  app.use("/reports", reportsRoutes);
  app.use("/subscription", subscriptionRoutes);

  // Fallthrough 404 handler
  app.use((_req: Request, _res: Response, next) => {
    next(new NotFoundError("The requested API route does not exist"));
  });

  // Centralized Error Handler (DRY)
  app.use(errorHandler);

  return app;
};
