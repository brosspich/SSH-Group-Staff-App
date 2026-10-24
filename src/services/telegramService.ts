import { AttendanceRecord } from "@/app/(tabs)/index";
import { supabase } from "@/utils/supabase";

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

// In-memory cache for database telegram configuration
let cachedTelegramConfig: TelegramConfig | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

/**
 * Parses raw chat ID value (string, array of strings/numbers, or JSON) into a cleaned string array.
 */
export function parseChatIds(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof raw === "number") {
    return [String(raw)];
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
      if (parsed) {
        return String(parsed)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    } catch {
      return trimmed
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
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
export function setCachedTelegramConfig(config: TelegramConfig): void {
  cachedTelegramConfig = config;
  lastFetchTime = Date.now();
}

/**
 * Fetches Telegram Bot Token and Chat IDs dynamically from Supabase table: `ssh-group-staff-attendance-qr`.
 * Uses cached values if fetched within CACHE_TTL_MS unless forceRefresh is true.
 */
export async function fetchTelegramConfigFromDB(
  forceRefresh = false,
): Promise<TelegramConfig> {
  const now = Date.now();
  if (
    !forceRefresh &&
    cachedTelegramConfig &&
    now - lastFetchTime < CACHE_TTL_MS
  ) {
    return cachedTelegramConfig;
  }

  try {
    const { data, error } = await supabase
      .from("ssh-group-staff-attendance-qr")
      .select("*");

    if (error) {
      console.warn(
        "Failed to fetch Telegram config from Supabase:",
        error.message,
      );
    } else if (data && Array.isArray(data) && data.length > 0) {
      const row = data[0];

      // 1. Process Telegram Bot Token from database
      const rawBotCol =
        row["telegram_bot_token"] ??
        row["bot_token"] ??
        row["botToken"] ??
        row["telegramBotToken"];
      const { primaryToken, allTokens } = parseBotTokens(rawBotCol);

      // 2. Process Telegram Chat ID from database
      // Supports both 'tlegram_chat_id' (table schema column) and 'telegram_chat_id'
      const rawChatCol =
        row["tlegram_chat_id"] ??
        row["telegram_chat_id"] ??
        row["chat_id"] ??
        row["chatId"] ??
        row["telegramChatId"];
      const parsedChatIds = parseChatIds(rawChatCol);

      // const resolvedBotToken = primaryToken || DEFAULT_BOT_TOKEN;
      //  const resolvedChatIds =
      //   parsedChatIds.length > 0
      //     ? parsedChatIds
      //     : parseChatIds(DEFAULT_CHAT_ID);
      const resolvedBotToken = primaryToken;
      const resolvedChatIds = parsedChatIds;

      const config: TelegramConfig = {
        botToken: resolvedBotToken,
        botTokens: allTokens.length > 0 ? allTokens : [resolvedBotToken],
        chatIds: resolvedChatIds,
      };

      setCachedTelegramConfig(config);
      return config;
    }
  } catch (err) {
    console.warn(
      "Exception while fetching Telegram config from Supabase:",
      err,
    );
  }

  // Database only: no default fallback credentials
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
    `🆔 <b>Staff ID:</b> ${staffId}\n` +
    `👤 <b>Name:</b> ${name}\n` +
    `📌 <b>Status:</b> ${typeLabel}\n` +
    `📅 <b>Date:</b> ${date}\n` +
    `⏰ <b>Time:</b> ${time}`
  );
}

/**
 * Sends attendance log details to ALL active Telegram groups.
 * Dynamically retrieves Bot Token and Chat IDs from Supabase table `ssh-group-staff-attendance-qr`.
 * Non-blocking operation: errors are logged silently to ensure scan flow is unaffected.
 */
export async function sendAttendanceToTelegram(
  record: AttendanceRecord,
  customConfig?: TelegramNotificationConfig,
): Promise<boolean> {
  // 1. Fetch dynamic config from database (or in-memory cache)
  const dbConfig = await fetchTelegramConfigFromDB();

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

  // Send message to all target chat IDs
  const sendPromises = Array.from(targetChatIds).map(async (chatId) => {
    try {
      const endpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: "HTML",
        }),
      });
      const data = await response.json();
      if (response.ok && data.ok) {
        console.log(`Successfully sent attendance to Telegram chat: ${chatId}`);
        return true;
      } else {
        console.warn(`Failed to send to Telegram chat ${chatId}:`, data);
        return false;
      }
    } catch (err) {
      console.warn(`Error sending to Telegram chat ${chatId}:`, err);
      return false;
    }
  });

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
        groupIds.add(String(chat.id));
      }
    }
    return Array.from(groupIds);
  } catch (error) {
    console.warn("Error fetching active Telegram group chat IDs:", error);
    return [];
  }
}
