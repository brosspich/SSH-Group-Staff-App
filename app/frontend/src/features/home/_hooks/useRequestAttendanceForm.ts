import {
  formatTimeDisplay,
  getOfficialTimeIn,
  getOfficialTimeOut,
} from "@/shared/constants/attendanceConfig";
import { submitAttendanceRequest } from "@/shared/services/attendanceRequestService";
import { StaffUser, userService } from "@/shared/services/userService";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import { Keyboard } from "react-native";
import { formatDateYMD } from "../_utils/homeUtils";

export interface UseRequestAttendanceFormParams {
  visible: boolean;
  user?: StaffUser | null;
  onClose: () => void;
  onSubmit?: (data: {
    subject: string;
    remark: string;
    date: string;
    time: string;
    fromDate?: string;
    fromTime?: string;
    toDate?: string;
    toTime?: string;
    image?: string;
  }) => Promise<void> | void;
}

export function useRequestAttendanceForm({
  visible,
  user,
  onClose,
  onSubmit,
}: UseRequestAttendanceFormParams) {
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(
    user || null,
  );

  // Sync user state
  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    } else {
      userService.get().then((u) => {
        if (u) setCurrentUser(u);
      });
    }
  }, [user, visible]);

  // Date & Time states
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [fromTime, setFromTime] = useState<string>(() =>
    formatTimeDisplay(getOfficialTimeIn(), "08:00 AM"),
  );
  const [toDate, setToDate] = useState<Date>(new Date());
  const [toTime, setToTime] = useState<string>(() =>
    formatTimeDisplay(getOfficialTimeOut(), "05:00 PM"),
  );

  // Pickers
  const [datePickerTarget, setDatePickerTarget] = useState<
    "from" | "to" | null
  >(null);
  const [timePickerTarget, setTimePickerTarget] = useState<
    "from" | "to" | null
  >(null);

  // Form inputs
  const [subject, setSubject] = useState("");
  const [remark, setRemark] = useState("");

  // Proof Image states
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageSourceModalVisible, setImageSourceModalVisible] = useState(false);

  // Status & Validation
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);

  // Confirmation Modal
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  // Alert Modal
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertBody, setAlertBody] = useState("");
  const [alertOnPress, setAlertOnPress] = useState<(() => void) | undefined>(
    undefined,
  );

  // Reset form when opened
  useEffect(() => {
    if (visible) {
      const now = new Date();
      setFromDate(now);
      setFromTime(formatTimeDisplay(getOfficialTimeIn(), "08:00 AM"));
      setToDate(now);
      setToTime(formatTimeDisplay(getOfficialTimeOut(), "05:00 PM"));
      setDatePickerTarget(null);
      setTimePickerTarget(null);
      setSubject("");
      setRemark("");
      setImageUri(null);
      setImageBase64(null);
      setImageError(null);
      setImageSourceModalVisible(false);
      setErrorMessage(null);
      setSubmitting(false);
      isSubmittingRef.current = false;
      setConfirmModalVisible(false);
      setAlertModalVisible(false);
      setAlertTitle("");
      setAlertBody("");
      setAlertOnPress(undefined);
    }
  }, [visible]);

  const handlePickImage = async (useCamera = false) => {
    try {
      const permissionMethod = useCamera
        ? ImagePicker.requestCameraPermissionsAsync
        : ImagePicker.requestMediaLibraryPermissionsAsync;

      const { status } = await permissionMethod();
      if (status !== "granted") {
        setAlertTitle("Permission Required");
        setAlertBody(
          `${useCamera ? "Camera" : "Gallery"} permission is required to select proof photo.`,
        );
        setAlertModalVisible(true);
        return;
      }

      const pickerMethod = useCamera
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync;

      const result = await pickerMethod({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setImageUri(asset.uri);

        let b64 = asset.base64;
        if (!b64 && asset.uri) {
          try {
            b64 = await FileSystem.readAsStringAsync(asset.uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
          } catch (e) {
            console.warn("Failed to read image file as base64:", e);
          }
        }

        const mime =
          asset.mimeType ||
          (asset.uri.toLowerCase().endsWith(".png")
            ? "image/png"
            : "image/jpeg");

        setImageBase64(b64 ? `data:${mime};base64,${b64}` : asset.uri);
        setImageError(null);
      }
    } catch (err: any) {
      console.warn("Error picking image:", err);
      setAlertTitle("Upload Error");
      setAlertBody(err?.message || "Could not choose image. Please try again.");
      setAlertModalVisible(true);
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
    setImageBase64(null);
    setImageError(null);
  };

  const handleClose = () => {
    Keyboard.dismiss();
    setConfirmModalVisible(false);
    onClose();
  };

  const handleAlertDismiss = (vis: boolean) => {
    setAlertModalVisible(vis);
    if (!vis && alertTitle === "Request Submitted") {
      handleClose();
    }
  };

  const handleOpenConfirm = () => {
    if (!subject.trim()) {
      setErrorMessage("Please enter a subject.");
      return;
    }
    if (!remark.trim()) {
      setErrorMessage("Please enter a remark.");
      return;
    }

    const targetUser = currentUser || user;
    if (!targetUser?.id) {
      setErrorMessage("User information not found. Please log in again.");
      return;
    }

    setErrorMessage(null);
    Keyboard.dismiss();
    setConfirmModalVisible(true);
  };

  const handleConfirmSubmit = async () => {
    if (isSubmittingRef.current) return;
    const targetUser = currentUser || user;
    if (!targetUser?.id) {
      setErrorMessage("User information not found. Please log in again.");
      setConfirmModalVisible(false);
      return;
    }

    isSubmittingRef.current = true;
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const fromDateStr = formatDateYMD(fromDate);
      const toDateStr = formatDateYMD(toDate);

      await submitAttendanceRequest({
        user: targetUser,
        fromDate: fromDateStr,
        fromTime,
        toDate: toDateStr,
        toTime,
        subject: subject.trim(),
        remark: remark.trim(),
        image: imageBase64 || imageUri || undefined,
      });

      if (onSubmit) {
        await onSubmit({
          subject: subject.trim(),
          remark: remark.trim(),
          date: fromDateStr,
          time: fromTime,
          fromDate: fromDateStr,
          fromTime,
          toDate: toDateStr,
          toTime,
          image: imageBase64 || imageUri || undefined,
        });
      }

      setConfirmModalVisible(false);
      setAlertTitle("Request Submitted");
      setAlertBody(
        "Your attendance request has been saved and sent to Telegram successfully.",
      );
      setAlertOnPress(() => () => {
        handleClose();
      });
      setAlertModalVisible(true);
    } catch (err: any) {
      console.warn("Error submitting attendance request:", err);
      setConfirmModalVisible(false);
      setAlertTitle("Submission Failed");
      setAlertBody(
        err?.message ||
          "Failed to submit attendance request. Please try again.",
      );
      setAlertOnPress(undefined);
      setAlertModalVisible(true);
    } finally {
      setSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  return {
    currentUser,
    fromDate,
    setFromDate,
    fromTime,
    setFromTime,
    toDate,
    setToDate,
    toTime,
    setToTime,
    datePickerTarget,
    setDatePickerTarget,
    timePickerTarget,
    setTimePickerTarget,
    subject,
    setSubject,
    remark,
    setRemark,
    imageUri,
    imageBase64,
    imageError,
    imageSourceModalVisible,
    setImageSourceModalVisible,
    submitting,
    errorMessage,
    setErrorMessage,
    confirmModalVisible,
    setConfirmModalVisible,
    alertModalVisible,
    alertTitle,
    alertBody,
    alertOnPress,
    handlePickImage,
    handleRemoveImage,
    handleClose,
    handleAlertDismiss,
    handleOpenConfirm,
    handleConfirmSubmit,
  };
}
