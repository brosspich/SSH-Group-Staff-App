import { AttendanceRecord } from "@/app/(tabs)/index";

// Default configuration from environment variables
const DEFAULT_BOT_TOKEN =
  process.env.EXPO_PUBLIC_TELEGRAM_BOT_TOKEN ||
  "8911068365:AAEyHW4A2kWmTCAZgal606ArSsuVwArGEvE";

const DEFAULT_CHAT_ID =
  process.env.EXPO_PUBLIC_TELEGRAM_CHAT_ID || "-5567020132";

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
    `📋 <b>SSH GROUP - STAFF ATTENDANCE</b>\n\n` +
    `👤 <b>Name:</b> ${name}\n` +
    `🆔 <b>Staff ID:</b> ${staffId}\n` +
    `📌 <b>Status:</b> ${typeLabel}\n` +
    `📅 <b>Date:</b> ${date}\n` +
    `⏰ <b>Time:</b> ${time}`
  );
}

/**
 * Sends attendance log details to Telegram Bot API.
 * Non-blocking operation: errors are logged silently to ensure scan flow is unaffected.
 */
export async function sendAttendanceToTelegram(
  record: AttendanceRecord,
  customConfig?: TelegramNotificationConfig
): Promise<boolean> {
  const botToken = customConfig?.botToken || DEFAULT_BOT_TOKEN;
  const chatId = customConfig?.chatId || DEFAULT_CHAT_ID;

  if (!botToken) {
    console.warn("Telegram Bot Token is missing. Message not sent.");
    return false;
  }

  if (!chatId) {
    console.warn(
      "Telegram Chat ID is missing. Please set EXPO_PUBLIC_TELEGRAM_CHAT_ID in .env.local or your environment."
    );
    return false;
  }

  const messageText = formatAttendanceMessage(record);
  const endpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: "HTML",
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      console.warn("Failed to send Telegram attendance message:", data);
      return false;
    }

    console.log("Attendance notification successfully sent to Telegram group/chat.");
    return true;
  } catch (error) {
    console.warn("Error sending attendance notification to Telegram:", error);
    return false;
  }
}
