/**
 * Telegram Service (Frontend Helpers)
 *
 * NOTE: Telegram message and photo dispatches are executed 100% on the Backend
 * (via /attendance-security and /attendance-requests).
 *
 * This file contains parsing, formatting, and caching helpers used by configuration services.
 */

export interface TelegramConfig {
  botToken: string;
  botTokens?: string[];
  chatIds: string[];
}

// In-memory cache for telegram configuration per system key (e.g. "system-0001", "system-0002")
const cachedTelegramBySystem: Record<
  string,
  { config: TelegramConfig; timestamp: number }
> = {};
let cachedTelegramConfig: TelegramConfig | null = null;

/**
 * Normalizes Telegram Chat ID, mapping migrated group IDs to their supergroup counterparts.
 */
export function normalizeChatId(id: string): string {
  const trimmed = String(id).trim();
  if (trimmed === "-5567020132") {
    return "-1004319410551";
  }
  return trimmed;
}

/**
 * Parses raw chat ID value (string, array of strings/numbers, or JSON) into a cleaned string array.
 */
export function parseChatIds(raw: any): string[] {
  if (!raw) return [];
  let list: string[] = [];
  if (Array.isArray(raw)) {
    list = raw.map((item) => String(item).trim()).filter(Boolean);
  } else if (typeof raw === "number") {
    list = [String(raw)];
  } else if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        list = parsed.map((item) => String(item).trim()).filter(Boolean);
      } else if (parsed) {
        list = String(parsed)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    } catch {
      list = trimmed
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  // Handle Telegram group migration (e.g. -5567020132 upgraded to supergroup -1004319410551)
  const result: string[] = [];
  for (const id of list) {
    result.push(normalizeChatId(id));
  }

  return Array.from(new Set(result));
}

/**
 * Parses raw bot token value (string, array, or JSON) into a cleaned string.
 */
export function parseBotTokens(raw: any): {
  primaryToken: string;
  allTokens: string[];
} {
  let tokens: string[] = [];
  if (Array.isArray(raw)) {
    tokens = raw.map((t) => String(t).trim()).filter(Boolean);
  } else if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          tokens = parsed.map((t) => String(t).trim()).filter(Boolean);
        } else if (parsed) {
          tokens = [String(parsed).trim()];
        }
      } catch {
        tokens = [trimmed];
      }
    }
  }

  return {
    primaryToken: tokens[0] || "",
    allTokens: tokens,
  };
}

/**
 * Sets or updates the in-memory cached Telegram configuration.
 */
export function setCachedTelegramConfig(
  config: TelegramConfig,
  systemKey?: string,
): void {
  const { extractSystemKey } = require("@/shared/constants/attendanceConfig");
  const key = systemKey ? extractSystemKey(systemKey) : "default";
  cachedTelegramBySystem[key] = {
    config,
    timestamp: Date.now(),
  };
  cachedTelegramConfig = config;
}

/**
 * Retrieves the cached Telegram configuration if available.
 */
export function getCachedTelegramConfig(
  systemKey?: string,
): TelegramConfig | null {
  if (systemKey && cachedTelegramBySystem[systemKey]) {
    return cachedTelegramBySystem[systemKey].config;
  }
  return cachedTelegramConfig;
}
