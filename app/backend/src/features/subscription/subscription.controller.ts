import { Request, Response } from "express";
import { Logger } from "../../core/utils/logger.js";
import { d1Client } from "../../infrastructure/database/d1Client.js";
import { prisma } from "../../infrastructure/database/prisma.js";

// Fast in-memory cache for subscription checks (5 minutes TTL)
const subscriptionCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export function calculateSubscriptionDetails(row: any) {
  if (!row) {
    return {
      id: "",
      systemId: "",
      plan: "None",
      startDate: "",
      endDate: "",
      createdAt: "",
      status: "Inactive",
      daysRemaining: 0,
      isExpired: true,
      hasSubscription: false,
    };
  }

  const rawEndDate = row.end_date || row.endDate || "";
  const rawStartDate = row.start_date || row.startDate || "";

  let daysRemaining = 0;
  let isExpired = true;

  if (rawEndDate) {
    const end = new Date(rawEndDate);
    const today = new Date();

    // Set today to start of day for accurate remaining days calculation
    const endDay = new Date(
      end.getFullYear(),
      end.getMonth(),
      end.getDate(),
    ).getTime();
    const currentDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    ).getTime();

    const diffTime = endDay - currentDay;
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    isExpired = daysRemaining <= 0;
  }

  // Format plan display e.g. "1_year" -> "1 Year"
  let formattedPlan = String(row.plan || "1 Year");
  if (
    formattedPlan.toLowerCase() === "1_year" ||
    formattedPlan.toLowerCase() === "1 year"
  ) {
    formattedPlan = "1 Year";
  } else if (
    formattedPlan.toLowerCase() === "6_month" ||
    formattedPlan.toLowerCase() === "6 months" ||
    formattedPlan.toLowerCase() === "6 month"
  ) {
    formattedPlan = "6 Months";
  } else if (
    formattedPlan.toLowerCase() === "3_month" ||
    formattedPlan.toLowerCase() === "3 months" ||
    formattedPlan.toLowerCase() === "3 month"
  ) {
    formattedPlan = "3 Months";
  } else if (
    formattedPlan.toLowerCase() === "1_month" ||
    formattedPlan.toLowerCase() === "1 month"
  ) {
    formattedPlan = "1 Month";
  }

  return {
    id: row.id,
    systemId: row.system_id || row.systemId,
    plan: formattedPlan,
    startDate: rawStartDate,
    endDate: rawEndDate,
    createdAt: row.createdAt || row.created_at || "",
    status: isExpired ? "Inactive" : "Active",
    daysRemaining: Math.max(0, daysRemaining),
    isExpired,
    hasSubscription: true,
  };
}

export class SubscriptionController {
  /**
   * GET /api/v1/subscription/check/:systemId
   * Checks subscription status matching companyId to Subscription table's system_id
   */
  async checkSubscription(req: Request, res: Response): Promise<void> {
    try {
      const rawParam =
        req.params.systemId ??
        req.query.system_id ??
        req.query.company_id ??
        req.query.companyId ??
        "";
      const rawId = Array.isArray(rawParam)
        ? String(rawParam[0] || "")
        : String(rawParam || "");
      const cleanRaw = rawId.trim();

      if (!cleanRaw) {
        res.status(400).json({
          success: false,
          message: "systemId or companyId is required",
        });
        return;
      }

      // ── Step A: Resolve companyId from input ──
      // 1. Direct regex extract e.g. "system-0002" from "system-0002-0001" or "system-0002"
      let companyId = cleanRaw.toLowerCase();
      const compMatch = cleanRaw.match(/^(system-\d+(?:\.\d+)?)/i);
      if (compMatch) {
        companyId = compMatch[1].toLowerCase();
      } else if (cleanRaw.toLowerCase().startsWith("bpak")) {
        companyId = "system-0002";
      }

      // 2. Query UserDetails to find companyId if rawId matches a user's systemId, staff id, or username
      try {
        const userDetail = await prisma.userDetails.findFirst({
          where: {
            OR: [
              { systemId: cleanRaw },
              { user: { id: cleanRaw } },
              { user: { username: cleanRaw } },
            ],
          },
          select: { companyId: true },
        });
        if (userDetail?.companyId && userDetail.companyId.trim()) {
          companyId = userDetail.companyId.trim().toLowerCase();
        }
      } catch (e: any) {
        // Fallback to extracted companyId
      }

      const systemId = companyId;

      // Fast cache (30s) unless force=true is requested for live real-time updates
      const forceRefresh =
        req.query.force === "true" ||
        req.headers["cache-control"] === "no-cache";

      if (!forceRefresh) {
        const cached = subscriptionCache.get(systemId);
        if (cached && Date.now() - cached.timestamp < 30 * 1000) {
          res.status(200).json({
            success: true,
            data: cached.data,
            cached: true,
          });
          return;
        }
      }

      // 1. Query local SQLite
      let row: any = null;
      try {
        const rows = await prisma.$queryRawUnsafe<any[]>(
          `SELECT * FROM Subscription WHERE LOWER(system_id) = ? LIMIT 1`,
          systemId,
        );
        if (rows && rows.length > 0) {
          row = rows[0];
        }
      } catch (dbErr: any) {
        Logger.warn(
          `Local SQLite Subscription query warning: ${dbErr?.message}`,
        );
      }

      // 2. Check Cloudflare D1 if:
      //   - row not found in local DB, OR
      //   - local row is expired, OR
      //   - forceRefresh is requested (real-time check)
      const localDetails = row ? calculateSubscriptionDetails(row) : null;
      if (!row || localDetails?.isExpired || forceRefresh) {
        try {
          const d1Rows = await d1Client.query(
            `SELECT * FROM Subscription WHERE LOWER(system_id) = ? LIMIT 1`,
            [systemId],
          );
          if (d1Rows && d1Rows.length > 0) {
            const d1Row = d1Rows[0];
            const d1Details = calculateSubscriptionDetails(d1Row);
            // If local had no record, or D1 has an active subscription, or D1 has newer dates:
            if (!row || !d1Details.isExpired || localDetails?.isExpired) {
              row = d1Row;
              // Self-healing: persist D1's record into local SQLite dev.db in background
              prisma
                .$queryRawUnsafe(
                  `INSERT OR REPLACE INTO Subscription (id, system_id, plan, start_date, end_date, createdAt)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                  d1Row.id,
                  d1Row.system_id || systemId,
                  d1Row.plan || "1 Year",
                  d1Row.start_date || d1Row.startDate || "",
                  d1Row.end_date || d1Row.endDate || "",
                  d1Row.createdAt || new Date().toISOString(),
                )
                .catch(() => {});
            }
          }
        } catch (d1Err: any) {
          Logger.warn(
            `Cloudflare D1 Subscription query note: ${d1Err?.message}`,
          );
        }
      }

      const details = calculateSubscriptionDetails(row);

      // Cache the result
      subscriptionCache.set(systemId, {
        data: details,
        timestamp: Date.now(),
      });

      res.status(200).json({
        success: true,
        data: details,
      });
    } catch (err: any) {
      Logger.error("Failed to check subscription", err);
      res.status(500).json({
        success: false,
        message: err.message || "Failed to check subscription",
      });
    }
  }

  /**
   * GET /api/v1/subscription
   * Returns all subscriptions (Local DB & D1 fallback)
   */
  async getAllSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      let rows: any[] = [];
      try {
        rows = await prisma.$queryRawUnsafe<any[]>(
          `SELECT * FROM Subscription ORDER BY system_id ASC`,
        );
      } catch (dbErr: any) {
        Logger.warn(`Local SQLite Subscription error: ${dbErr?.message}`);
      }

      if (rows.length === 0) {
        try {
          rows = await d1Client.query(
            `SELECT * FROM Subscription ORDER BY system_id ASC`,
          );
        } catch (d1Err: any) {
          Logger.warn(`Cloudflare D1 Subscription error: ${d1Err?.message}`);
        }
      }

      const formatted = rows.map(calculateSubscriptionDetails);
      res.status(200).json({
        success: true,
        count: formatted.length,
        data: formatted,
      });
    } catch (err: any) {
      Logger.error("Failed to fetch subscriptions", err);
      res.status(500).json({
        success: false,
        message: err.message || "Failed to fetch subscriptions",
      });
    }
  }

  /**
   * POST /api/v1/subscription
   * Upsert a subscription record (Syncs to local dev.db and Cloudflare D1)
   */
  async upsertSubscription(req: Request, res: Response): Promise<void> {
    try {
      const {
        id,
        system_id,
        systemId,
        plan,
        start_date,
        startDate,
        end_date,
        endDate,
      } = req.body;
      const targetSystemId = (system_id || systemId || "").trim();
      const targetPlan = (plan || "1 Year").trim();
      const targetStart = (start_date || startDate || "").trim();
      const targetEnd = (end_date || endDate || "").trim();

      if (!targetSystemId) {
        res.status(400).json({
          success: false,
          message: "system_id is required",
        });
        return;
      }

      // Generate ID if not provided (e.g. SUB-0001)
      let recordId = (id || "").trim();
      if (!recordId) {
        const sysMatch = targetSystemId.match(/\d+/);
        const num = sysMatch
          ? sysMatch[0].padStart(4, "0")
          : String(Date.now()).slice(-4);
        recordId = `SUB-${num}`;
      }

      const now = new Date().toISOString();

      // 1. Local SQLite dev.db
      await prisma.$executeRawUnsafe(
        `INSERT OR REPLACE INTO Subscription (id, system_id, plan, start_date, end_date, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
        recordId,
        targetSystemId,
        targetPlan,
        targetStart,
        targetEnd,
        now,
      );

      // 2. Cloudflare D1 sync
      try {
        await d1Client.execute(
          `INSERT OR REPLACE INTO Subscription (id, system_id, plan, start_date, end_date, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
          [recordId, targetSystemId, targetPlan, targetStart, targetEnd, now],
        );
      } catch (d1Err: any) {
        Logger.warn(`D1 Subscription sync error: ${d1Err?.message}`);
      }

      // Invalidate cache
      subscriptionCache.delete(targetSystemId.toLowerCase());

      const result = calculateSubscriptionDetails({
        id: recordId,
        system_id: targetSystemId,
        plan: targetPlan,
        start_date: targetStart,
        end_date: targetEnd,
        createdAt: now,
      });

      res.status(200).json({
        success: true,
        message: "Subscription saved successfully",
        data: result,
      });
    } catch (err: any) {
      Logger.error("Failed to upsert subscription", err);
      res.status(500).json({
        success: false,
        message: err.message || "Failed to save subscription",
      });
    }
  }
}

export const subscriptionController = new SubscriptionController();
