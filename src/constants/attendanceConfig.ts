import {
  parseBotTokens,
  parseChatIds,
  setCachedTelegramConfig,
} from "@/services/telegramService";
import { supabase } from "@/utils/supabase";

/**
 * Default fallback valid QR Code payloads for SSH Group Staff Attendance.
 */
// export const DEFAULT_OFFICIAL_ATTENDANCE_QR_CODES: string[] = [
//   "SSH_GROUP_ATTENDANCE_OFFICIAL_QR_2026",
//   "SSH-GROUP-STAFF-ATTENDANCE",
//   "https://sshgroup.com/attendance",
//   "SSH_GROUP_ATTENDANCE",
//   "ssh-group-attendance-01",
// ];

// export let OFFICIAL_ATTENDANCE_QR_CODES: string[] = [
//   ...DEFAULT_OFFICIAL_ATTENDANCE_QR_CODES,
// ];

// export let COMPANY_NAME: string = "SSH Group";

// export let OFFICIAL_LOCATION_LINKS: string[] = [
//   "https://maps.app.goo.gl/MmFnRaN1ueSwSk48A",
// ];

let fetchedAttendanceQrCode: string[] = [];
let fetchedCompanyName: string = "";
let fetchedLocationLink: string[] = [];
let fetchedBotToken = "";
let fetchedChatIds: string[] = [];

export interface OfficialAttendanceConfig {
  qrCodes: string[];
  companyName: string;
  locationLinks: string[];
  telegramBotToken?: string;
  telegramChatIds?: string[];
}

/**
 * Helper to get currently loaded company name from database
 */
export function getCompanyName(): string {
  return fetchedCompanyName;
}

/**
 * Helper to get currently loaded official QR codes from database
 */
export function getOfficialAttendanceQRCodes(): string[] {
  return fetchedAttendanceQrCode;
}

/**
 * Fetches official attendance QR codes, company name, location links,
 * and telegram configuration dynamically from Supabase table: ssh-group-staff-attendance-qr
 */
export async function fetchOfficialAttendanceConfig(): Promise<OfficialAttendanceConfig> {
  try {
    const { data } = await supabase
      .from("ssh-group-staff-attendance-qr")
      .select("*");

    if (data && Array.isArray(data) && data.length > 0) {
      const row = data[0];

      // 1. Process QR codes
      const qrCol = row["qr-code"] ?? row["qr_code"] ?? row["qrCode"];
      let qrList: string[] = [];

      if (Array.isArray(qrCol)) {
        qrList = qrCol;
      } else if (typeof qrCol === "string") {
        try {
          qrList = JSON.parse(qrCol);
        } catch (e) {}
      }

      if (Array.isArray(qrList) && qrList.length > 0) {
        fetchedAttendanceQrCode = qrList;
      }

      // 2. Process Company Name
      const compCol = row["company_name"] ?? row["companyName"];
      if (compCol && typeof compCol === "string" && compCol.trim()) {
        fetchedCompanyName = compCol.trim();
      }

      // 3. Process Location Links
      const locCol =
        row["location"] ?? row["location_links"] ?? row["locationLinks"];
      let locList: string[] = [];

      if (Array.isArray(locCol)) {
        locList = locCol.map((l) => String(l).trim()).filter(Boolean);
      } else if (typeof locCol === "string" && locCol.trim()) {
        try {
          const parsed = JSON.parse(locCol);
          if (Array.isArray(parsed)) {
            locList = parsed.map((l) => String(l).trim()).filter(Boolean);
          } else {
            locList = [locCol.trim()];
          }
        } catch (e) {
          locList = [locCol.trim()];
        }
      }

      if (locList.length > 0) {
        fetchedLocationLink = locList;
      }

      // 4. Process Telegram Bot Token & Chat IDs
      const rawBotCol =
        row["telegram_bot_token"] ??
        row["bot_token"] ??
        row["botToken"] ??
        row["telegramBotToken"];
      const { primaryToken, allTokens } = parseBotTokens(rawBotCol);
      fetchedBotToken = primaryToken;

      const rawChatCol =
        row["tlegram_chat_id"] ??
        row["telegram_chat_id"] ??
        row["chat_id"] ??
        row["chatId"] ??
        row["telegramChatId"];
      fetchedChatIds = parseChatIds(rawChatCol);

      if (primaryToken || fetchedChatIds.length > 0) {
        setCachedTelegramConfig({
          botToken: primaryToken,
          botTokens: allTokens,
          chatIds: fetchedChatIds,
        });
      }
    }
  } catch (err) {
    // Database only: errors logged without fallback
    console.warn(
      "Exception while fetching attendance config from Supabase:",
      err,
    );
  }

  return {
    qrCodes: fetchedAttendanceQrCode,
    companyName: fetchedCompanyName,
    locationLinks: fetchedLocationLink,
    telegramBotToken: fetchedBotToken,
    telegramChatIds: fetchedChatIds,
  };
}

/**
 * Backward-compatible helper to fetch official attendance QR codes list
 */
export async function fetchOfficialAttendanceQRCodes(): Promise<string[]> {
  const config = await fetchOfficialAttendanceConfig();
  return config.qrCodes;
}

/**
 * Validates whether scanned QR data matches official attendance QR code setup
 * @param scannedData Raw string read from camera scan
 * @param validList Optional list of valid QR codes (defaults to fetchedAttendanceQrCode)
 * @returns boolean
 */
export function isValidAttendanceQR(
  scannedData: string,
  validList: string[] = fetchedAttendanceQrCode,
): boolean {
  if (!scannedData || typeof scannedData !== "string") return false;
  const trimmed = scannedData.trim();
  const listToUse =
    validList && validList.length > 0 ? validList : fetchedAttendanceQrCode;

  if (!listToUse || listToUse.length === 0) return false;

  return listToUse.some(
    (validQr) =>
      trimmed === validQr || trimmed.toLowerCase() === validQr.toLowerCase(),
  );
}
