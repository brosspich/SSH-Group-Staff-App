import { supabase } from "@/utils/supabase";

/**
 * Default fallback valid QR Code payloads for SSH Group Staff Attendance.
 */
export const DEFAULT_OFFICIAL_ATTENDANCE_QR_CODES: string[] = [
  "SSH_GROUP_ATTENDANCE_OFFICIAL_QR_2026",
  "SSH-GROUP-STAFF-ATTENDANCE",
  "https://sshgroup.com/attendance",
  "SSH_GROUP_ATTENDANCE",
  "ssh-group-attendance-01",
];

export let OFFICIAL_ATTENDANCE_QR_CODES: string[] = [
  ...DEFAULT_OFFICIAL_ATTENDANCE_QR_CODES,
];

export let COMPANY_NAME: string = "SSH Group";

export let OFFICIAL_LOCATION_LINKS: string[] = [
  "https://maps.app.goo.gl/MmFnRaN1ueSwSk48A",
];

export interface OfficialAttendanceConfig {
  qrCodes: string[];
  companyName: string;
  locationLinks: string[];
}

/**
 * Fetches official attendance QR codes, company name, and location links
 * dynamically from Supabase table: ssh-group-staff-attendance-qr
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
      let fetchedQrList: string[] = [];

      if (Array.isArray(qrCol)) {
        fetchedQrList = qrCol;
      } else if (typeof qrCol === "string") {
        try {
          fetchedQrList = JSON.parse(qrCol);
        } catch (e) {}
      }

      if (Array.isArray(fetchedQrList) && fetchedQrList.length > 0) {
        OFFICIAL_ATTENDANCE_QR_CODES = fetchedQrList;
      }

      // 2. Process Company Name
      const compCol = row["company_name"] ?? row["companyName"];
      if (compCol && typeof compCol === "string" && compCol.trim()) {
        COMPANY_NAME = compCol.trim();
      }

      // 3. Process Location Links
      const locCol =
        row["location"] ?? row["location_links"] ?? row["locationLinks"];
      let fetchedLocList: string[] = [];

      if (Array.isArray(locCol)) {
        fetchedLocList = locCol.map((l) => String(l).trim()).filter(Boolean);
      } else if (typeof locCol === "string" && locCol.trim()) {
        try {
          const parsed = JSON.parse(locCol);
          if (Array.isArray(parsed)) {
            fetchedLocList = parsed
              .map((l) => String(l).trim())
              .filter(Boolean);
          } else {
            fetchedLocList = [locCol.trim()];
          }
        } catch (e) {
          fetchedLocList = [locCol.trim()];
        }
      }

      if (fetchedLocList.length > 0) {
        OFFICIAL_LOCATION_LINKS = fetchedLocList;
      }
    }
  } catch (err) {
    // Fallback to default in-memory values on network/fetch exception
  }

  return {
    qrCodes: OFFICIAL_ATTENDANCE_QR_CODES,
    companyName: COMPANY_NAME,
    locationLinks: OFFICIAL_LOCATION_LINKS,
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
 * @param validList Optional list of valid QR codes (defaults to OFFICIAL_ATTENDANCE_QR_CODES)
 * @returns boolean
 */
export function isValidAttendanceQR(
  scannedData: string,
  validList: string[] = OFFICIAL_ATTENDANCE_QR_CODES,
): boolean {
  if (!scannedData || typeof scannedData !== "string") return false;
  const trimmed = scannedData.trim();
  const listToUse =
    validList.length > 0 ? validList : DEFAULT_OFFICIAL_ATTENDANCE_QR_CODES;

  return listToUse.some(
    (validQr) =>
      trimmed === validQr || trimmed.toLowerCase() === validQr.toLowerCase(),
  );
}
