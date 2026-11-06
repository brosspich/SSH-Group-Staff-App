import { apiClient } from "@/shared/services/api";
import {
  parseBotTokens,
  parseChatIds,
  setCachedTelegramConfig,
} from "@/shared/services/telegramService";

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
let fetchedTimeIn: string = "08:00:00";
let fetchedTimeOut: string = "17:00:00";

// 5-minute memory cache for official attendance config (keyed by system key e.g. "system-0001", "system-0002")
const cachedConfigsBySystem: Record<
  string,
  { config: OfficialAttendanceConfig; timestamp: number }
> = {};
const ATTENDANCE_CONFIG_CACHE_TTL = 5 * 60 * 1000;

export interface OfficialAttendanceConfig {
  qrCodes: string[];
  companyName: string;
  locationLinks: string[];
  telegramBotToken?: string;
  telegramChatIds?: string[];
  timeIn: string;
  timeOut: string;
}

/**
 * Extracts system code (e.g. "system-0001" from "system-0001-0006" or "system-0002" from "system-0002-0001")
 */
export function extractSystemKey(systemId?: string): string {
  if (!systemId || typeof systemId !== "string") return "";
  const trimmed = systemId.trim().toLowerCase();
  const match = trimmed.match(/^(system-\d+)/i);
  if (match) return match[1];
  return trimmed;
}

export interface DynamicSystemItem {
  id: string; // e.g. "system-0001"
  companyName?: string; // e.g. "SSH Coffee & Bakery"
}

/**
 * Dynamically queries all unique company/branch systems registered in database
 * (checking both the attendance-qr configuration table and user accounts).
 */
export async function fetchAvailableCompanySystems(): Promise<
  DynamicSystemItem[]
> {
  const systemMap = new Map<string, string | undefined>();

  try {
    // 1. Fetch from backend /company-query
    const qrData = await apiClient.get<any[]>("/company-query");

    if (qrData && Array.isArray(qrData)) {
      qrData.forEach((row: any) => {
        const sysId = extractSystemKey(String(row.id || ""));
        if (sysId) {
          const compName =
            typeof row.company_name === "string" && row.company_name.trim()
              ? row.company_name.trim()
              : undefined;
          systemMap.set(sysId.toLowerCase(), compName);
        }
      });
    }
  } catch (e) {
    console.warn("fetchAvailableCompanySystems: error querying QR table", e);
  }

  try {
    // 2. Fetch distinct system_ids from backend /users-query
    const usersData = await apiClient
      .get<any[]>("/users-query")
      .catch(() => []);

    if (usersData && Array.isArray(usersData)) {
      usersData.forEach((row: any) => {
        const sysId = extractSystemKey(String(row.system_id || ""));
        if (sysId && !systemMap.has(sysId.toLowerCase())) {
          systemMap.set(sysId.toLowerCase(), undefined);
        }
      });
    }
  } catch (e) {
    console.warn("fetchAvailableCompanySystems: error querying users table", e);
  }

  // Fallback defaults if database has no records
  if (systemMap.size === 0) {
    systemMap.set("system-0001", undefined);
    systemMap.set("system-0002", undefined);
  }

  const result: DynamicSystemItem[] = Array.from(systemMap.entries()).map(
    ([id, companyName]) => ({ id, companyName }),
  );

  result.sort((a, b) =>
    a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: "base" }),
  );

  return result;
}

/**
 * Resolves the system key (e.g. "system-0001", "system-0002") from a systemId, staffId (e.g. "bpak-0001"),
 * or the currently authenticated user in local storage.
 * If input is "bpak-0001", it queries ssh_group_staff_users to find its system_id ("system-0002-0001") -> "system-0002".
 */
export async function resolveSystemKey(input?: string): Promise<string> {
  if (input && typeof input === "string") {
    const trimmed = input.trim();
    if (trimmed.toLowerCase().startsWith("bpak")) {
      return "system-0002";
    }
    // If it's already a system id (e.g. "system-0002-0001" or "system-0002"), extract immediately
    if (/^system-\d+/i.test(trimmed)) {
      return extractSystemKey(trimmed);
    }
  }

  // 1. Check local user in storage
  try {
    const { userService } = require("@/shared/services/userService");
    const localUser = await userService.get();
    if (localUser) {
      const lowerUid = String(localUser.id || "").toLowerCase();
      const lowerUsys = String(localUser.system_id || "").toLowerCase();
      if (lowerUid.startsWith("bpak") || lowerUsys.startsWith("bpak")) {
        return "system-0002";
      }
      if (
        (!input || localUser.id === input || localUser.username === input) &&
        localUser.system_id &&
        /^system-\d+/i.test(localUser.system_id)
      ) {
        return extractSystemKey(localUser.system_id);
      }
    }
  } catch (e) {}

  // 2. If input was given (e.g. "bpak-0001" or "0022"), query database to find their system_id
  if (input && typeof input === "string") {
    const trimmed = input.trim();
    try {
      const userRow = await apiClient
        .get<any>(`/users-query/${trimmed}`)
        .catch(() => null);

      if (userRow) {
        const uId = String(userRow.id || "").toLowerCase();
        const uSys = String(userRow.system_id || "").toLowerCase();
        if (uId.startsWith("bpak") || uSys.startsWith("bpak")) {
          return "system-0002";
        }
        if (uSys && /^system-\d+/i.test(uSys)) {
          return extractSystemKey(uSys);
        }
      }
    } catch (e) {
      console.warn("Error resolving system_id from DB for staff:", input, e);
    }
  }

  // 3. Fallback to currently logged in user's system_id if available
  try {
    const { userService } = require("@/shared/services/userService");
    const localUser = await userService.get();
    if (localUser?.system_id && /^system-\d+/i.test(localUser.system_id)) {
      return extractSystemKey(localUser.system_id);
    }
  } catch (e) {}

  return "";
}

/**
 * Helper to get currently loaded company name from database
 */
export function getCompanyName(systemIdOrStaffId?: string): string {
  if (systemIdOrStaffId) {
    const raw = String(systemIdOrStaffId).trim().toLowerCase();
    let key = extractSystemKey(raw).toLowerCase();
    if (raw.startsWith("bpak")) {
      key = "system-0002";
    }
    if (key && cachedConfigsBySystem[key]?.config?.companyName) {
      return cachedConfigsBySystem[key].config.companyName;
    }
  }
  return fetchedCompanyName || "";
}

/**
 * Helper to get currently loaded official QR codes from database
 */
export function getOfficialAttendanceQRCodes(): string[] {
  return fetchedAttendanceQrCode;
}

/**
 * Helper to get currently loaded official Time-In from database
 */
export function getOfficialTimeIn(): string {
  return fetchedTimeIn;
}

/**
 * Helper to get currently loaded official Time-Out from database
 */
export function getOfficialTimeOut(): string {
  return fetchedTimeOut;
}

/**
 * Formats a time string (e.g. "08:00:00" or "17:00") into a clean 12-hour format like "8:00 AM" or "5:00 PM"
 */
export function formatTimeDisplay(
  timeStr?: string,
  defaultFallback: string = "8:00 AM",
): string {
  if (!timeStr || typeof timeStr !== "string") return defaultFallback;
  const parts = timeStr.trim().split(":");
  if (parts.length < 2) return timeStr;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const period = h >= 12 ? "PM" : "AM";
  const displayHours = h % 12 === 0 ? 12 : h % 12;
  const displayMinutes = m > 0 ? `:${String(m).padStart(2, "0")}` : ":00";
  return `${displayHours}${displayMinutes} ${period}`;
}

/**
 * Fetches official attendance QR codes, company name, location links,
 * and telegram configuration dynamically from Backend API table: ssh-group-staff-attendance-qr
 */
export async function fetchOfficialAttendanceConfig(
  forceRefresh: boolean = false,
  systemId?: string,
): Promise<OfficialAttendanceConfig> {
  const now = Date.now();
  const targetKey = await resolveSystemKey(systemId);
  const cacheKey = targetKey || "default";

  if (
    !forceRefresh &&
    cachedConfigsBySystem[cacheKey] &&
    now - cachedConfigsBySystem[cacheKey].timestamp <
      ATTENDANCE_CONFIG_CACHE_TTL
  ) {
    const cached = cachedConfigsBySystem[cacheKey].config;
    fetchedAttendanceQrCode = cached.qrCodes;
    fetchedCompanyName = cached.companyName;
    fetchedLocationLink = cached.locationLinks;
    fetchedBotToken = cached.telegramBotToken || "";
    fetchedChatIds = cached.telegramChatIds || [];
    fetchedTimeIn = cached.timeIn;
    fetchedTimeOut = cached.timeOut;
    return cached;
  }

  try {
    const data = await apiClient.get<any[]>("/company-query", {
      timeout: 10000,
    });

    if (data && Array.isArray(data) && data.length > 0) {
      // Pre-cache every company system configuration row from DB
      data.forEach((r: any) => {
        const rowSys = extractSystemKey(String(r.id || "")).toLowerCase();
        if (rowSys) {
          const comp = r["company_name"] ?? r["companyName"];
          const compName =
            typeof comp === "string" && comp.trim() ? comp.trim() : "";
          const qrC = r["qr-code"] ?? r["qr_code"] ?? r["qrCode"];
          let qList: string[] = [];
          if (Array.isArray(qrC)) {
            qList = qrC;
          } else if (typeof qrC === "string") {
            try {
              qList = JSON.parse(qrC);
            } catch (e) {}
          }
          const locC =
            r["location"] ?? r["location_links"] ?? r["locationLinks"];
          let lList: string[] = [];
          if (Array.isArray(locC)) {
            lList = locC.map((l: any) => String(l).trim()).filter(Boolean);
          } else if (typeof locC === "string" && locC.trim()) {
            try {
              const parsed = JSON.parse(locC);
              if (Array.isArray(parsed)) {
                lList = parsed
                  .map((l: any) => String(l).trim())
                  .filter(Boolean);
              } else {
                lList = [locC.trim()];
              }
            } catch (e) {
              lList = [locC.trim()];
            }
          }
          const rawBot =
            r["telegram_bot_token"] ??
            r["bot_token"] ??
            r["botToken"] ??
            r["telegramBotToken"];
          const { primaryToken, allTokens } = parseBotTokens(rawBot);
          const rawChat =
            r["telegram_chat_id"] ??
            r["chat_id"] ??
            r["chatId"] ??
            r["telegramChatId"];
          const cIds = parseChatIds(rawChat);

          const rTimeIn =
            r["time-in"] ?? r["time_in"] ?? r["timeIn"] ?? "08:00:00";
          const rTimeOut =
            r["time-out"] ?? r["time_out"] ?? r["timeOut"] ?? "17:00:00";

          cachedConfigsBySystem[rowSys] = {
            config: {
              qrCodes: qList,
              companyName: compName,
              locationLinks: lList,
              telegramBotToken: primaryToken,
              telegramChatIds: cIds,
              timeIn:
                typeof rTimeIn === "string" && rTimeIn.trim()
                  ? rTimeIn.trim()
                  : "08:00:00",
              timeOut:
                typeof rTimeOut === "string" && rTimeOut.trim()
                  ? rTimeOut.trim()
                  : "17:00:00",
            },
            timestamp: now,
          };
        }
      });

      let row = targetKey
        ? data.find(
            (r) =>
              extractSystemKey(String(r.id || "")).toLowerCase() ===
              targetKey.toLowerCase(),
          )
        : data[0];

      if (!row) {
        return {
          qrCodes: [],
          companyName: "",
          locationLinks: [],
          timeIn: "08:00:00",
          timeOut: "17:00:00",
        };
      }

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
        row["telegram_chat_id"] ??
        row["telegram_chat_id"] ??
        row["chat_id"] ??
        row["chatId"] ??
        row["telegramChatId"];
      fetchedChatIds = parseChatIds(rawChatCol);

      if (primaryToken || fetchedChatIds.length > 0) {
        setCachedTelegramConfig(
          {
            botToken: primaryToken,
            botTokens: allTokens,
            chatIds: fetchedChatIds,
          },
          targetKey,
        );
      }

      // 5. Process Time-In & Time-Out from database
      const rawTimeIn =
        row["time-in"] ??
        row["time_in"] ??
        row["timeIn"] ??
        row["time_in_time"];
      if (rawTimeIn && typeof rawTimeIn === "string" && rawTimeIn.trim()) {
        fetchedTimeIn = rawTimeIn.trim();
      }

      const rawTimeOut =
        row["time-out"] ??
        row["time_out"] ??
        row["timeOut"] ??
        row["time_out_time"];
      if (rawTimeOut && typeof rawTimeOut === "string" && rawTimeOut.trim()) {
        fetchedTimeOut = rawTimeOut.trim();
      }
    }
  } catch (err) {
    // Database only: errors logged without fallback
    console.warn(
      "Exception while fetching attendance config from Backend API:",
      err,
    );
  }

  const result: OfficialAttendanceConfig = {
    qrCodes: fetchedAttendanceQrCode,
    companyName: fetchedCompanyName,
    locationLinks: fetchedLocationLink,
    telegramBotToken: fetchedBotToken,
    telegramChatIds: fetchedChatIds,
    timeIn: fetchedTimeIn,
    timeOut: fetchedTimeOut,
  };

  cachedConfigsBySystem[cacheKey] = {
    config: result,
    timestamp: now,
  };
  return result;
}

/**
 * Backward-compatible helper to fetch official attendance QR codes list
 */
export async function fetchOfficialAttendanceQRCodes(
  forceRefresh: boolean = false,
  systemId?: string,
): Promise<string[]> {
  const config = await fetchOfficialAttendanceConfig(forceRefresh, systemId);
  return config.qrCodes;
}

/**
 * Parses time strings in 24-hour (e.g. "08:00:00", "17:00") or 12-hour (e.g. "08:00 AM", "05:00 PM")
 * into total minutes from midnight (0 - 1439).
 */
export function parseTimeToMinutes(
  timeStr?: string,
  defaultMins: number = 480,
): number {
  if (!timeStr || typeof timeStr !== "string") return defaultMins;
  const clean = timeStr.trim().toLowerCase();
  const isPM = clean.includes("pm");
  const isAM = clean.includes("am");

  const stripped = clean.replace(/am|pm/g, "").trim();
  const parts = stripped.split(":");
  if (parts.length < 2) return defaultMins;

  let h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return defaultMins;

  if (isPM && h < 12) {
    h += 12;
  } else if (isAM && h === 12) {
    h = 0;
  }

  return h * 60 + m;
}

/**
 * Returns the exact 1-hour before and 1-hour after window for a given time
 * E.g., "08:00:00" -> target: "8:00 AM", start: "7:00 AM", end: "9:00 AM"
 * E.g., "17:00:00" -> target: "5:00 PM", start: "4:00 PM", end: "6:00 PM"
 * E.g., "07:00:00" -> target: "7:00 AM", start: "6:00 AM", end: "8:00 AM"
 * E.g., "16:00:00" -> target: "4:00 PM", start: "3:00 PM", end: "5:00 PM"
 */
export function getTimeWindowDisplay(
  timeStr?: string,
  defaultTarget: string = "08:00:00",
): { target: string; start: string; end: string; windowText: string } {
  const targetMinutes = parseTimeToMinutes(timeStr || defaultTarget, 480);
  const startMinutes = (targetMinutes - 60 + 1440) % 1440;
  const endMinutes = (targetMinutes + 60) % 1440;

  const minutesToTime12h = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m > 0 ? `:${String(m).padStart(2, "0")}` : ":00";
    return `${displayH}${displayM} ${period}`;
  };

  const target = minutesToTime12h(targetMinutes);
  const start = minutesToTime12h(startMinutes);
  const end = minutesToTime12h(endMinutes);

  return {
    target,
    start,
    end,
    windowText: `${start} - ${end}`,
  };
}

/**
 * Classifies current time into time-in, time-out, or time-other dynamically
 * based on database time-in and time-out (defaults to 08:00:00 and 17:00:00).
 *
 * Examples:
 * - time-in = 08:00 AM -> Current TIME-IN: 07:00 AM to 09:00 AM
 * - time-out = 05:00 PM -> Current TIME-OUT: 04:00 PM to 06:00 PM
 *
 * - time-in = 07:00 AM -> Current TIME-IN: 06:00 AM to 08:00 AM
 * - time-out = 04:00 PM -> Current TIME-OUT: 03:00 PM to 05:00 PM
 *
 * - Any other time -> Current TIME-OTHER
 */
export function calculateAttendanceType(
  now = new Date(),
  customTimeIn?: string,
  customTimeOut?: string,
): "time-in" | "time-out" | "time-other" {
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // 1. Time-In Window: [time-in - 60min, time-in + 60min]
  const inTarget = parseTimeToMinutes(customTimeIn || fetchedTimeIn, 480); // 8:00 AM = 480
  const inStart = inTarget - 60;
  const inEnd = inTarget + 60;

  // 2. Time-Out Window: [time-out - 60min, time-out + 60min]
  const outTarget = parseTimeToMinutes(customTimeOut || fetchedTimeOut, 1020); // 17:00 = 1020
  const outStart = outTarget - 60;
  const outEnd = outTarget + 60;

  if (totalMinutes >= inStart && totalMinutes <= inEnd) {
    return "time-in";
  }

  if (totalMinutes >= outStart && totalMinutes <= outEnd) {
    return "time-out";
  }

  return "time-other";
}

function normalizeQrString(str: string): string {
  if (!str) return "";
  let s = str.trim();
  // Strip outer quotes
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  // Strip trailing slashes
  s = s.replace(/\/+$/, "");
  return s.toLowerCase();
}

/**
 * Validates whether scanned QR data matches official attendance QR code setup.
 * Ultra-fast matching with normalization and URL-decoding tolerance.
 * @param scannedData Raw string read from camera scan
 * @param validList Optional list of valid QR codes (defaults to fetchedAttendanceQrCode)
 * @returns boolean
 */
export function isValidAttendanceQR(
  scannedData: string,
  validList: string[] = fetchedAttendanceQrCode,
): boolean {
  if (!scannedData || typeof scannedData !== "string") return false;
  const listToUse =
    validList && validList.length > 0 ? validList : fetchedAttendanceQrCode;

  if (!listToUse || listToUse.length === 0) return false;

  const rawClean = normalizeQrString(scannedData);
  let decodedClean = rawClean;
  try {
    decodedClean = normalizeQrString(decodeURIComponent(scannedData));
  } catch (e) {}

  return listToUse.some((validQr) => {
    if (!validQr || typeof validQr !== "string") return false;
    const cleanValid = normalizeQrString(validQr);
    let decodedValid = cleanValid;
    try {
      decodedValid = normalizeQrString(decodeURIComponent(validQr));
    } catch (e) {}

    return (
      rawClean === cleanValid ||
      decodedClean === decodedValid ||
      rawClean === decodedValid ||
      decodedClean === cleanValid
    );
  });
}
