import { AttendanceRecord } from "@/app/(tabs)/index";

// Default configuration from environment variables
const DEFAULT_BOT_TOKEN =
  process.env.EXPO_PUBLIC_TELEGRAM_BOT_TOKEN ||
  "8911068365:AAEyHW4A2kWmTCAZgal606ArSsuVwArGEvE";

const DEFAULT_CHAT_ID =
  process.env.EXPO_PUBLIC_TELEGRAM_CHAT_ID || "-5567020132,-5354551298";

export interface TelegramNotificationConfig {
  botToken?: string;
  chatId?: string;
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
 * Non-blocking operation: errors are logged silently to ensure scan flow is unaffected.
 */
export async function sendAttendanceToTelegram(
  record: AttendanceRecord,
  customConfig?: TelegramNotificationConfig,
): Promise<boolean> {
  const botToken = customConfig?.botToken || DEFAULT_BOT_TOKEN;
  const rawChatId = customConfig?.chatId || DEFAULT_CHAT_ID;

  if (!botToken) {
    console.warn("Telegram Bot Token is missing. Message not sent.");
    return false;
  }

  const messageText = formatAttendanceMessage(record);

  // Collect unique chat IDs to send to
  const targetChatIds = new Set<string>();

  // 1. Parse configured Chat IDs (supports comma-separated list)
  if (rawChatId) {
    rawChatId.split(",").forEach((id) => {
      const trimmed = id.trim();
      if (trimmed) targetChatIds.add(trimmed);
    });
  }

  // 2. Auto-detect all active group IDs from Telegram API
  const detectedGroupIds = await getAllActiveGroupChatIds(botToken);
  detectedGroupIds.forEach((id) => targetChatIds.add(id));

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
