import { Request, Response } from "express";
import { Logger } from "../../core/utils/logger.js";
import { prisma } from "../../infrastructure/database/prisma.js";

export interface SocialPlatformBackend {
  id: string;
  name: string;
  url: string;
  backgroundColor: string;
  iconFamily:
    | "Ionicons"
    | "MaterialIcons"
    | "MaterialCommunityIcons"
    | "Fontisto";
  iconName: string;
  iconSize?: number;
}

export interface SystemConfigData {
  support: {
    telegramUrl: string;
    telegramFallbackUrl: string;
    phone: string;
    email: string;
  };
  social: {
    facebook: string;
    youtube: string;
    tiktok: string;
    telegram: string;
    website: string;
    line: string;
    location: string;
  };
  socialPlatforms: SocialPlatformBackend[];
  app: {
    name: string;
    minVersion: string;
    latestVersion: string;
    maintenanceMode: boolean;
  };
}

const DEFAULT_CONFIG: SystemConfigData = {
  support: {
    telegramUrl: "https://t.me/sshgroup168",
    telegramFallbackUrl: "https://telegram.org",
    phone: "092696698",
    email: "support@sshgroups.com",
  },
  social: {
    facebook: "https://www.facebook.com/SSHGROUP168",
    youtube: "https://www.youtube.com/@SSH-GROUP",
    tiktok: "https://www.tiktok.com/@ssh3group",
    telegram: "https://t.me/ssh_T01",
    website: "https://www.sshgroups.com",
    line: "https://line.me/ti/p/dp-pR3kCIL",
    location: "https://maps.app.goo.gl/k9eE8y9k1YQjN9UFA",
  },
  socialPlatforms: [
    {
      id: "facebook",
      name: "FACEBOOK",
      url: "https://www.facebook.com/SSHGROUP168",
      backgroundColor: "#1877F2",
      iconFamily: "Ionicons",
      iconName: "logo-facebook",
      iconSize: 24,
    },
    {
      id: "youtube",
      name: "YOUTUBE",
      url: "https://www.youtube.com/@SSH-GROUP",
      backgroundColor: "#FF0000",
      iconFamily: "Ionicons",
      iconName: "logo-youtube",
      iconSize: 24,
    },
    {
      id: "tiktok",
      name: "TIKTOK",
      url: "https://www.tiktok.com/@ssh3group",
      backgroundColor: "#010101",
      iconFamily: "Ionicons",
      iconName: "logo-tiktok",
      iconSize: 24,
    },
    {
      id: "telegram",
      name: "TELEGRAM",
      url: "https://t.me/ssh_T01",
      backgroundColor: "#0088cc",
      iconFamily: "MaterialIcons",
      iconName: "telegram",
      iconSize: 24,
    },
    {
      id: "website",
      name: "WEBSITE",
      url: "https://www.sshgroups.com",
      backgroundColor: "#36855B",
      iconFamily: "MaterialCommunityIcons",
      iconName: "web",
      iconSize: 24,
    },
    {
      id: "line",
      name: "LINE",
      url: "https://line.me/ti/p/dp-pR3kCIL",
      backgroundColor: "#06C755",
      iconFamily: "Fontisto",
      iconName: "line",
      iconSize: 23,
    },
    {
      id: "whatsapp",
      name: "WHATSAPP",
      url: "https://wa.me/qr/DQYXDOX6CRWZO1",
      backgroundColor: "#25D366",
      iconFamily: "Ionicons",
      iconName: "logo-whatsapp",
      iconSize: 24,
    },
  ],
  app: {
    name: "SSH Group Staff",
    minVersion: "1.0.0",
    latestVersion: "1.0.1",
    maintenanceMode: false,
  },
};

let cachedConfig: { data: SystemConfigData; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

async function ensureTableExists() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS SystemConfig (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err: any) {
    Logger.warn(`SystemConfig table verification warning: ${err?.message}`);
  }
}

export class SystemConfigController {
  /**
   * GET /api/v1/system-config
   * Returns current dynamic system links & configurations
   */
  async getConfig(req: Request, res: Response): Promise<void> {
    try {
      const force = req.query.force === "true";
      if (
        !force &&
        cachedConfig &&
        Date.now() - cachedConfig.timestamp < CACHE_TTL_MS
      ) {
        res.status(200).json({
          success: true,
          data: cachedConfig.data,
          cached: true,
        });
        return;
      }

      await ensureTableExists();

      let dbConfig: Partial<SystemConfigData> = {};
      try {
        const rows = await prisma.$queryRawUnsafe<any[]>(
          `SELECT key, value FROM SystemConfig`,
        );
        if (rows && rows.length > 0) {
          for (const row of rows) {
            try {
              (dbConfig as any)[row.key] = JSON.parse(row.value);
            } catch {
              (dbConfig as any)[row.key] = row.value;
            }
          }
        }
      } catch (err: any) {
        Logger.warn(
          `Failed to read SystemConfig from local SQLite: ${err?.message}`,
        );
      }

      // Merge with defaults
      const merged: SystemConfigData = {
        support: { ...DEFAULT_CONFIG.support, ...(dbConfig.support || {}) },
        social: { ...DEFAULT_CONFIG.social, ...(dbConfig.social || {}) },
        socialPlatforms:
          dbConfig.socialPlatforms || DEFAULT_CONFIG.socialPlatforms,
        app: { ...DEFAULT_CONFIG.app, ...(dbConfig.app || {}) },
      };

      cachedConfig = { data: merged, timestamp: Date.now() };

      res.status(200).json({
        success: true,
        data: merged,
      });
    } catch (err: any) {
      Logger.error("Failed to get system configuration", err);
      res.status(200).json({
        success: true,
        data: DEFAULT_CONFIG,
      });
    }
  }

  /**
   * PUT /api/v1/system-config
   * Updates dynamic links and configuration items
   */
  async updateConfig(req: Request, res: Response): Promise<void> {
    try {
      const { support, social, app } = req.body;
      await ensureTableExists();

      if (support && typeof support === "object") {
        await prisma.$executeRawUnsafe(
          `INSERT OR REPLACE INTO SystemConfig (key, value, updatedAt) VALUES ('support', ?, CURRENT_TIMESTAMP)`,
          JSON.stringify(support),
        );
      }

      if (social && typeof social === "object") {
        await prisma.$executeRawUnsafe(
          `INSERT OR REPLACE INTO SystemConfig (key, value, updatedAt) VALUES ('social', ?, CURRENT_TIMESTAMP)`,
          JSON.stringify(social),
        );
      }

      if (app && typeof app === "object") {
        await prisma.$executeRawUnsafe(
          `INSERT OR REPLACE INTO SystemConfig (key, value, updatedAt) VALUES ('app', ?, CURRENT_TIMESTAMP)`,
          JSON.stringify(app),
        );
      }

      // Invalidate cache
      cachedConfig = null;

      res.status(200).json({
        success: true,
        message: "System configuration updated successfully",
      });
    } catch (err: any) {
      Logger.error("Failed to update system configuration", err);
      res.status(500).json({
        success: false,
        message: err.message || "Failed to update system configuration",
      });
    }
  }

  /**
   * GET /api/v1/system-config/support-links
   * Shortcut for support contacts & links
   */
  async getSupportLinks(req: Request, res: Response): Promise<void> {
    try {
      const config = cachedConfig?.data || DEFAULT_CONFIG;
      res.status(200).json({
        success: true,
        data: config.support,
      });
    } catch (err: any) {
      res.status(200).json({
        success: true,
        data: DEFAULT_CONFIG.support,
      });
    }
  }
}
