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

/**
 * Fetches official attendance QR code list dynamically from Supabase table: ssh-group-staff-attendance-qr
 */
export async function fetchOfficialAttendanceQRCodes(): Promise<string[]> {
  try {
    const { data } = await supabase
      .from("ssh-group-staff-attendance-qr")
      .select("*");

    if (data && Array.isArray(data) && data.length > 0) {
      const row = data[0];
      const qrCol = row["qr-code"] ?? row["qr_code"] ?? row["qrCode"];
      let fetchedList: string[] = [];

      if (Array.isArray(qrCol)) {
        fetchedList = qrCol;
      } else if (typeof qrCol === "string") {
        try {
          fetchedList = JSON.parse(qrCol);
        } catch (e) {}
      }

      if (Array.isArray(fetchedList) && fetchedList.length > 0) {
        OFFICIAL_ATTENDANCE_QR_CODES = fetchedList;
        return fetchedList;
      }
    }
  } catch (err) {
    // Fallback to default in-memory list on network/fetch exception
  }

  return OFFICIAL_ATTENDANCE_QR_CODES;
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
