import { useAttendanceStore } from "@/features/attendance/store/useAttendanceStore";
import {
  prewarmDeviceGps,
  scanAttendanceWithSecurity,
  submitAttendanceRecord,
} from "@/shared/services/locationService";
import { StaffUser, userService } from "@/shared/services/userService";
import { useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import { Platform } from "react-native";
import { AttendanceRecord, AttendanceType } from "../_types/home.types";
import {
  formatDateYMD,
  formatTime12h,
  generateNextAttendanceId,
} from "../_utils/homeUtils";

interface UseHomeScannerProps {
  user: StaffUser | null;
  attendanceList: AttendanceRecord[];
  setAttendanceList: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  setUser: React.Dispatch<React.SetStateAction<StaffUser | null>>;
  companyName: string;
  officialQrList?: string[];
  currentType?: AttendanceType;
}

export function useHomeScanner({
  user,
  attendanceList,
  setAttendanceList,
  setUser,
  companyName,
  officialQrList = [],
  currentType = "time-other",
}: UseHomeScannerProps) {
  // Scanner modal states
  const [scannerVisible, setScannerVisible] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [scanned, setScanned] = useState(false);
  const isScanningRef = useRef(false);

  // Security checking states
  const [verifyingSecurity, setVerifyingSecurity] = useState(false);
  const [securityModalVisible, setSecurityModalVisible] = useState(false);
  const [securityErrorTitle, setSecurityErrorTitle] = useState(
    "Security Check Failed",
  );
  const [securityErrorMessage, setSecurityErrorMessage] = useState("");

  // Modals & alerts
  const [invalidQrModalVisible, setInvalidQrModalVisible] = useState(false);
  const [generalAlert, setGeneralAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: "",
    message: "",
  });

  const showGeneralAlert = (title: string, message: string) => {
    setGeneralAlert({ visible: true, title, message });
  };

  // Success result & Edit modals
  const [lastRecord, setLastRecord] = useState<AttendanceRecord | null>(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();

  // Open Scanner with Instant Camera Launch & Background GPS Pre-warming
  const handleOpenScanner = async () => {
    if (Platform.OS !== "web") {
      if (!permission?.granted) {
        const { status } = await requestPermission();
        if (status !== "granted") {
          showGeneralAlert(
            "Camera Access Needed",
            "Please allow camera access in Settings to scan QR code.",
          );
          return;
        }
      }
    }

    // 1. Launch camera immediately for 0ms response time
    setScanned(false);
    isScanningRef.current = false;
    setScannerVisible(true);

    // 2. Pre-warm GPS sensor in background concurrently while camera renders
    prewarmDeviceGps().catch(() => {});
  };

  // QR Code Scanner Handler with Zero-Delay Processing
  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isScanningRef.current) return;
    isScanningRef.current = true;
    setScanned(true);

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // ── Instant Client-side QR Validation (0ms response if wrong QR code) ──
    if (officialQrList && officialQrList.length > 0) {
      const cleanScan = (data || "").trim().toLowerCase();
      let decodedScan = cleanScan;
      try {
        decodedScan = decodeURIComponent(data).trim().toLowerCase();
      } catch {}

      const isMatch = officialQrList.some((code) => {
        if (!code) return false;
        const cleanCode = code.trim().toLowerCase();
        let decodedCode = cleanCode;
        try {
          decodedCode = decodeURIComponent(code).trim().toLowerCase();
        } catch {}
        return (
          cleanScan === cleanCode ||
          decodedScan === decodedCode ||
          cleanScan === decodedCode ||
          decodedScan === cleanCode
        );
      });

      if (!isMatch) {
        setScannerVisible(false);
        setInvalidQrModalVisible(true);
        isScanningRef.current = false;
        setScanned(false);
        return;
      }
    }

    // ── Instant 0ms Preview Record & Confirm Modal ──
    const now = new Date();
    const previewRec: AttendanceRecord = {
      id: generateNextAttendanceId(attendanceList),
      staff_id: user?.id || "",
      system_id: user?.system_id,
      name:
        user?.details?.name || user?.name || user?.username || "Staff Member",
      date: formatDateYMD(now),
      time: formatTime12h(now),
      type: currentType || "time-other",
      timestamp: now.toISOString(),
      qr_data: data,
    };

    // Show Confirm modal IMMEDIATELY (0ms delay - instant response!)
    setLastRecord(previewRec);
    setScannerVisible(false);
    setSuccessModalVisible(true);
    isScanningRef.current = false;
    setScanned(false);

    // ── Run backend security verification concurrently in the background ──
    scanAttendanceWithSecurity({
      userId: user?.id ?? "",
      systemId: user?.system_id,
      qrData: data,
      previewOnly: true,
    })
      .then((result) => {
        if (!result.allowed) {
          // If security check failed, dismiss confirm modal & show error modal
          setSuccessModalVisible(false);
          setLastRecord(null);

          if (result.code === "INVALID_QR") {
            setInvalidQrModalVisible(true);
          } else {
            let title = "Security Verification Failed";
            if (result.code === "OUT_OF_RANGE") {
              title = "Outside Company Location";
            } else if (result.code === "MOCK_LOCATION") {
              title = "Mock Location Detected";
            } else if (result.code === "VPN_DETECTED") {
              title = "VPN Connection Detected";
            }
            setSecurityErrorTitle(title);
            setSecurityErrorMessage(
              result.reason ||
                "Unable to verify security rules for attendance.",
            );
            setSecurityModalVisible(true);
          }
        } else if (result.record) {
          // Sync server-assigned official ID or evaluated type seamlessly
          setLastRecord((prev) =>
            prev
              ? {
                  ...prev,
                  id: result.record!.id || prev.id,
                  type: result.record!.type || prev.type,
                }
              : null,
          );
        }
      })
      .catch((e) => {
        console.warn("Background attendance check warning:", e);
      });
  };

  // Helper to commit saved record to state & local cache
  const commitAttendanceRecord = (savedRec: AttendanceRecord) => {
    setAttendanceList((prev) => {
      const filtered = prev.filter((r) => r.id !== savedRec.id);
      const next = [savedRec, ...filtered];
      next.sort((a, b) => {
        const tA = new Date(
          a.timestamp || a.createdAt || a.date || 0,
        ).getTime();
        const tB = new Date(
          b.timestamp || b.createdAt || b.date || 0,
        ).getTime();
        return tB - tA;
      });
      return next;
    });

    const nextList = [
      savedRec,
      ...attendanceList.filter((r) => r.id !== savedRec.id),
    ];
    if (user) {
      const updatedUser: StaffUser = {
        ...user,
        attendance: nextList,
      };
      setUser(updatedUser);
      userService.save(updatedUser).catch(() => {});
    }

    // Instantly sync to Attendance History store
    try {
      useAttendanceStore.getState().addRecord(savedRec);
    } catch {}

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  // Submit attendance record (Confirm)
  const handleConfirmAttendance = async () => {
    if (!lastRecord || !user?.id) return;

    try {
      setSavingAttendance(true);

      const result = await submitAttendanceRecord({
        userId: user.id,
        systemId: user.system_id || lastRecord.system_id,
        qrData: lastRecord.qr_data || "",
        date: lastRecord.date,
        time: lastRecord.time,
        type: lastRecord.type,
        timestamp: lastRecord.timestamp,
        name: lastRecord.name,
      });

      if (result?.record) {
        const savedRec: AttendanceRecord = {
          id: result.record.id,
          staff_id: result.record.staff_id,
          system_id: result.record.system_id,
          name: result.record.name,
          date: result.record.date,
          time: result.record.time,
          type: result.record.type,
          timestamp: result.record.timestamp,
          qr_data: result.record.qr_data,
        };

        commitAttendanceRecord(savedRec);
        setSuccessModalVisible(false);
        setLastRecord(null);
      }
    } catch (e: any) {
      showGeneralAlert(
        "Submission Error",
        e?.message || "Failed to submit attendance. Please try again.",
      );
    } finally {
      setSavingAttendance(false);
      isScanningRef.current = false;
      setScanned(false);
    }
  };

  // Submit edited attendance record
  const handleEditAttendanceSubmit = async (data: {
    type: "time-in" | "time-out";
    remark: string;
    image: string;
  }) => {
    if (!lastRecord || !user?.id) return;

    try {
      setSubmittingEdit(true);

      const result = await submitAttendanceRecord({
        userId: user.id,
        systemId: user.system_id || lastRecord.system_id,
        qrData: lastRecord.qr_data || "",
        date: lastRecord.date,
        time: lastRecord.time,
        type: data.type,
        timestamp: lastRecord.timestamp,
        name: lastRecord.name,
        remark: data.remark,
        image: data.image,
      });

      if (result?.record) {
        const savedRec: AttendanceRecord = {
          id: result.record.id,
          staff_id: result.record.staff_id,
          system_id: result.record.system_id,
          name: result.record.name,
          date: result.record.date,
          time: result.record.time,
          type: result.record.type,
          timestamp: result.record.timestamp,
          qr_data: result.record.qr_data,
          remark: result.record.remark,
          image: result.record.image,
        };

        commitAttendanceRecord(savedRec);
        setEditModalVisible(false);
        setSuccessModalVisible(false);
        setLastRecord(null);
      }
    } catch (e: any) {
      showGeneralAlert(
        "Submission Error",
        e?.message ||
          "Failed to submit attendance adjustment. Please try again.",
      );
    } finally {
      setSubmittingEdit(false);
      isScanningRef.current = false;
      setScanned(false);
    }
  };

  return {
    scannerVisible,
    setScannerVisible,
    torchOn,
    setTorchOn,
    scanned,
    setScanned,
    verifyingSecurity,
    securityModalVisible,
    setSecurityModalVisible,
    securityErrorTitle,
    securityErrorMessage,
    invalidQrModalVisible,
    setInvalidQrModalVisible,
    generalAlert,
    setGeneralAlert,
    lastRecord,
    setLastRecord,
    successModalVisible,
    setSuccessModalVisible,
    savingAttendance,
    editModalVisible,
    setEditModalVisible,
    submittingEdit,
    isScanningRef,
    handleOpenScanner,
    handleBarCodeScanned,
    handleConfirmAttendance,
    handleEditAttendanceSubmit,
  };
}
