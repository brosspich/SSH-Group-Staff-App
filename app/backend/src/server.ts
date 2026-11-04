import os from "os";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { Logger } from "./core/utils/logger.js";
import { prisma } from "./infrastructure/database/prisma.js";

function getLocalIp(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

const app = createApp();

const server = app.listen(env.PORT, "0.0.0.0", async () => {
  Logger.info(
    `🚀 SSH Group Backend API server is running on http://0.0.0.0:${env.PORT} in [${env.NODE_ENV}] mode.`,
  );
  try {
    await prisma.$connect();
    Logger.info("✅ Database connection established (dev.db / Cloudflare D1)");
  } catch (err) {
    Logger.error("❌ Database connection error:", err);
  }
  const localIp = getLocalIp();
  Logger.info(`📡 Ready for requests on http://${localIp}:${env.PORT} !`);
});

// Graceful process lifecycle management
const gracefulShutdown = async (signal: string) => {
  Logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    Logger.info("HTTP server closed.");
    await prisma.$disconnect();
    Logger.info("Database connection closed.");
    process.exit(0);
  });

  setTimeout(() => {
    Logger.error("Forced shutdown due to timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
