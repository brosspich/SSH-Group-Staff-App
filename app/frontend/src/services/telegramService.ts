import { AttendanceRecord } from "@/app/(tabs)/index";
import { apiClient } from "@/services/api";

// Fallback configuration from environment variables
// const DEFAULT_BOT_TOKEN =
//   process.env.EXPO_PUBLIC_TELEGRAM_BOT_TOKEN ||
//   "8911068365:AAEyHW4A2kWmTCAZgal606ArSsuVwArGEvE";

// const DEFAULT_CHAT_ID =
//   process.env.EXPO_PUBLIC_TELEGRAM_CHAT_ID || "-5567020132,-5354551298";

export interface TelegramConfig {
  botToken: string;
  botTokens?: string[];
  chatIds: string[];
}

export interface TelegramNotificationConfig {
  botToken?: string;
  chatId?: string | string[];
}

// In-memory cache for database telegram configuration per system key (e.g. "system-0001", "system-0002")
const cachedTelegramBySystem: Record<
  string,
  { config: TelegramConfig; timestamp: number }
> = {};
let cachedTelegramConfig: TelegramConfig | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

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
  const { extractSystemKey } = require("@/constants/attendanceConfig");
  const key = systemKey ? extractSystemKey(systemKey) : "default";
  cachedTelegramBySystem[key] = {
    config,
    timestamp: Date.now(),
  };
  cachedTelegramConfig = config;
  lastFetchTime = Date.now();
}

/**
 * Fetches Telegram Bot Token and Chat IDs dynamically from Backend API table: `ssh-group-staff-attendance-qr`.
 * Uses cached values if fetched within CACHE_TTL_MS unless forceRefresh is true.
 */
export async function fetchTelegramConfigFromDB(
  forceRefresh = false,
  systemId?: string,
): Promise<TelegramConfig> {
  const now = Date.now();
  const {
    resolveSystemKey,
    extractSystemKey,
  } = require("@/constants/attendanceConfig");
  const targetKey = await resolveSystemKey(systemId);
  const cacheKey = targetKey || "default";

  if (
    !forceRefresh &&
    cachedTelegramBySystem[cacheKey] &&
    now - cachedTelegramBySystem[cacheKey].timestamp < CACHE_TTL_MS
  ) {
    return cachedTelegramBySystem[cacheKey].config;
  }

  try {
    const data = await apiClient.get<any[]>("/company-query");

    if (data && Array.isArray(data) && data.length > 0) {
      let row = data[0];
      if (targetKey) {
        const found = data.find(
          (r: any) => extractSystemKey(String(r.id || "")) === targetKey,
        );
        if (found) row = found;
      }

      // 1. Process Telegram Bot Token from database
      const rawBotCol =
        row["telegram_bot_token"] ??
        row["bot_token"] ??
        row["botToken"] ??
        row["telegramBotToken"];
      const { primaryToken, allTokens } = parseBotTokens(rawBotCol);

      // 2. Process Telegram Chat ID from database
      const rawChatCol =
        row["tlegram_chat_id"] ??
        row["telegram_chat_id"] ??
        row["chat_id"] ??
        row["chatId"] ??
        row["telegramChatId"];
      const parsedChatIds = parseChatIds(rawChatCol);

      const resolvedBotToken = primaryToken;
      const resolvedChatIds = parsedChatIds;

      const config: TelegramConfig = {
        botToken: resolvedBotToken,
        botTokens: allTokens.length > 0 ? allTokens : [resolvedBotToken],
        chatIds: resolvedChatIds,
      };

      cachedTelegramBySystem[cacheKey] = {
        config,
        timestamp: now,
      };
      setCachedTelegramConfig(config);
      return config;
    }
  } catch (err) {
    console.warn(
      "Exception while fetching Telegram config from Backend API:",
      err,
    );
  }

  // Database only: no default fallback credentials
  if (cachedTelegramBySystem[cacheKey]?.config) {
    return cachedTelegramBySystem[cacheKey].config;
  }
  if (cachedTelegramConfig) return cachedTelegramConfig;

  // const fallbackConfig: TelegramConfig = {
  //   botToken: DEFAULT_BOT_TOKEN,
  //   botTokens: [DEFAULT_BOT_TOKEN],
  //   chatIds: parseChatIds(DEFAULT_CHAT_ID),
  // };

  const emptyConfig: TelegramConfig = {
    botToken: "",
    botTokens: [],
    chatIds: [],
  };
  setCachedTelegramConfig(emptyConfig);
  return emptyConfig;
}

/**
 * Formats an AttendanceRecord into a clean HTML message for Telegram.
 */
export function formatAttendanceMessage(record: AttendanceRecord): string {
  let typeLabel = "🔵 RECORDED";
  if (record.type === "time-in") {
    typeLabel = "🟢 TIME IN (CHECK IN)";
  } else if (record.type === "time-out") {
    typeLabel = "🔴 TIME OUT (CHECK OUT)";
  } else if (record.type === "time-other") {
    typeLabel = "🟡 OTHER RECORD";
  }

  const name = record.name || "N/A";
  const staffId = record.staff_id || "N/A";
  const date = record.date || "N/A";
  const time = record.time || "N/A";

  return (
    `🆔 <b>Staff ID :</b> ${staffId}\n` +
    `👤 <b>Name :</b> ${name}\n` +
    `📌 <b>Status :</b> ${typeLabel}\n` +
    `📅 <b>Date :</b> ${date}\n` +
    `⏰ <b>Time :</b> ${time}`
  );
}

/**
 * Helper to dispatch a single Telegram message with automatic handling of supergroup migrations.
 */
async function sendTelegramSingleMessage(
  botToken: string,
  chatId: string,
  messageText: string,
  sentChatIds?: Set<string>,
): Promise<boolean> {
  const targetId = normalizeChatId(chatId);
  if (sentChatIds && sentChatIds.has(targetId)) {
    return true;
  }

  const endpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: targetId,
        text: messageText,
        parse_mode: "HTML",
      }),
    });
    const data = await response.json();
    if (response.ok && data.ok) {
      console.log(`Successfully sent to Telegram chat: ${targetId}`);
      if (sentChatIds) sentChatIds.add(targetId);
      return true;
    }

    // Auto-handle group migration to supergroup (error 400 with migrate_to_chat_id parameter)
    if (data?.parameters?.migrate_to_chat_id) {
      const migratedChatId = normalizeChatId(
        String(data.parameters.migrate_to_chat_id),
      );
      if (sentChatIds && sentChatIds.has(migratedChatId)) {
        console.log(
          `Telegram chat ${targetId} migrated to supergroup ${migratedChatId}, but already sent. Skipping duplicate.`,
        );
        return true;
      }
      console.log(
        `Telegram chat ${targetId} migrated to supergroup ${migratedChatId}. Retrying...`,
      );
      const retryRes = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: migratedChatId,
          text: messageText,
          parse_mode: "HTML",
        }),
      });
      const retryData = await retryRes.json();
      if (retryRes.ok && retryData.ok) {
        console.log(
          `Successfully sent to migrated Telegram supergroup: ${migratedChatId}`,
        );
        if (sentChatIds) sentChatIds.add(migratedChatId);
        return true;
      }
      console.warn(
        `Failed retry on migrated supergroup ${migratedChatId}:`,
        retryData,
      );
    } else {
      console.warn(`Failed to send to Telegram chat ${targetId}:`, data);
    }
    return false;
  } catch (err) {
    console.warn(`Error sending to Telegram chat ${targetId}:`, err);
    return false;
  }
}

/**
 * Sends attendance log details to ALL active Telegram groups.
 * Dynamically retrieves Bot Token and Chat IDs from Backend API table `ssh-group-staff-attendance-qr`.
 * Non-blocking operation: errors are logged silently to ensure scan flow is unaffected.
 */
export async function sendAttendanceToTelegram(
  record: AttendanceRecord,
  customConfig?: TelegramNotificationConfig,
  systemId?: string,
): Promise<boolean> {
  // 1. Fetch dynamic config from database (or in-memory cache) matching staff system
  const { resolveSystemKey } = require("@/constants/attendanceConfig");
  const targetSystemKey = await resolveSystemKey(
    systemId || record.system_id || record.staff_id,
  );
  const dbConfig = await fetchTelegramConfigFromDB(false, targetSystemKey);

  const botToken = customConfig?.botToken || dbConfig.botToken;

  if (!botToken) {
    console.warn("Telegram Bot Token is missing. Message not sent.");
    return false;
  }

  const messageText = formatAttendanceMessage(record);

  // Collect unique chat IDs to send to
  const targetChatIds = new Set<string>();

  // 2. Add Chat IDs from custom config if specified, otherwise from DB
  if (customConfig?.chatId) {
    parseChatIds(customConfig.chatId).forEach((id) => targetChatIds.add(id));
  } else {
    dbConfig.chatIds.forEach((id) => targetChatIds.add(id));
  }

  // 3. Auto-detect all active group IDs from Telegram API
  try {
    const detectedGroupIds = await getAllActiveGroupChatIds(botToken);
    detectedGroupIds.forEach((id) => targetChatIds.add(id));
  } catch (err) {
    console.warn("Could not auto-detect active Telegram groups:", err);
  }

  if (targetChatIds.size === 0) {
    console.warn("No Telegram Chat IDs found. Message not sent.");
    return false;
  }

  // Send message to all unique target chat IDs
  const sentChatIds = new Set<string>();
  const sendPromises = Array.from(targetChatIds).map((chatId) =>
    sendTelegramSingleMessage(botToken, chatId, messageText, sentChatIds),
  );

  const results = await Promise.all(sendPromises);
  return results.some((success) => success);
}

/**
 * Sends attendance correction / rule request to all active Telegram groups.
 */
export async function sendAttendanceRequestToTelegram(request: {
  requestId?: string;
  staffId: string;
  systemId?: string;
  name: string;
  position?: string;
  subject: string;
  remark: string;
  date?: string;
  time?: string;
  fromDate?: string;
  fromTime?: string;
  toDate?: string;
  toTime?: string;
}): Promise<boolean> {
  const { resolveSystemKey } = require("@/constants/attendanceConfig");
  const targetSystemKey = await resolveSystemKey(
    request.systemId || request.staffId,
  );
  const dbConfig = await fetchTelegramConfigFromDB(false, targetSystemKey);
  const botToken = dbConfig.botToken;

  if (!botToken) {
    console.warn("Telegram Bot Token is missing for attendance request.");
    return false;
  }

  const now = new Date();
  const fromDateStr =
    request.fromDate || request.date || now.toISOString().split("T")[0];
  const fromTimeStr =
    request.fromTime ||
    request.time ||
    now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  const toDateStr = request.toDate || fromDateStr;
  const toTimeStr = request.toTime || "05:00 PM";

  let dateTimeSection = "";
  if (fromDateStr === toDateStr) {
    dateTimeSection =
      `📅 <b>Date :</b> ${fromDateStr}\n` +
      `⏰ <b>Time :</b> ${fromTimeStr} - ${toTimeStr}\n`;
  } else {
    dateTimeSection =
      `📅 <b>From :</b> ${fromDateStr} (${fromTimeStr})\n` +
      `📅 <b>To :</b> ${toDateStr} (${toTimeStr})\n`;
  }

  // const reqIdLine = request.requestId
  //   ? `🎫 <b>Request ID:</b> ${request.requestId}\n`
  //   : "";

  const messageText =
    `📝 <b>ATTENDANCE REQUEST</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    // reqIdLine +
    `🆔 <b>Staff ID :</b> ${request.staffId || "N/A"}\n` +
    `👤 <b>Name :</b> ${request.name || "N/A"}\n` +
    // `💼 <b>Position:</b> ${request.position || "Staff"}\n` +
    `📌 <b>Subject :</b> ${request.subject}\n` +
    `💬 <b>Remark :</b> ${request.remark}\n` +
    dateTimeSection +
    `━━━━━━━━━━━━━━━━━━━━`;

  const targetChatIds = new Set<string>(dbConfig.chatIds);
  try {
    const detectedGroupIds = await getAllActiveGroupChatIds(botToken);
    detectedGroupIds.forEach((id) => targetChatIds.add(id));
  } catch (err) {
    console.warn("Could not auto-detect active Telegram groups:", err);
  }

  if (targetChatIds.size === 0) {
    console.warn("No Telegram Chat IDs found for request.");
    return false;
  }

  const sentChatIds = new Set<string>();
  const sendPromises = Array.from(targetChatIds).map((chatId) =>
    sendTelegramSingleMessage(botToken, chatId, messageText, sentChatIds),
  );

  const results = await Promise.all(sendPromises);
  return results.some((success) => success);
}

/**
 * Automatically fetches ALL active group or supergroup chat IDs from Telegram bot updates.
 */
export async function getAllActiveGroupChatIds(
  botToken: string,
): Promise<string[]> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getUpdates`,
    );
    const data = await response.json();
    if (!data.ok || !Array.isArray(data.result)) return [];

    const groupIds = new Set<string>();
    for (const update of data.result) {
      const chat =
        update.message?.chat ||
        update.my_chat_member?.chat ||
        update.channel_post?.chat;

      if (chat && (chat.type === "group" || chat.type === "supergroup")) {
        groupIds.add(normalizeChatId(String(chat.id)));
      }
    }
    return Array.from(groupIds);
  } catch (error) {
    console.warn("Error fetching active Telegram group chat IDs:", error);
    return [];
  }
}
