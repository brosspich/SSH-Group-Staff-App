import type {
  AttendanceRecord,
  EditAttendanceSubmitPayload,
} from "@/features/home/_types/home.types";
import * as Device from "expo-device";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";

interface UseEditAttendanceFormParams {
  visible: boolean;
  record: AttendanceRecord | null;
  onSubmit: (data: EditAttendanceSubmitPayload) => void;
}

export function useEditAttendanceForm({
  visible,
  record,
  onSubmit,
}: UseEditAttendanceFormParams) {
  const [selectedType, setSelectedType] = useState<"time-in" | "time-out">(
    "time-in",
  );
  const [remark, setRemark] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [remarkError, setRemarkError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageSourceModalVisible, setImageSourceModalVisible] = useState(false);

  // Generic Alert Modal state
  const [genericAlert, setGenericAlert] = useState<{
    visible: boolean;
    title: string;
    body: string;
  }>({
    visible: false,
    title: "",
    body: "",
  });

  const showAlert = (title: string, body: string) => {
    setGenericAlert({ visible: true, title, body });
  };

  const dismissAlert = () => {
    setGenericAlert((prev) => ({ ...prev, visible: false }));
  };

  // Reset or populate fields when record or visibility changes
  useEffect(() => {
    if (visible && record) {
      setSelectedType(record.type === "time-out" ? "time-out" : "time-in");
      setRemark("");
      setImageUri(null);
      setImageBase64(null);
      setRemarkError(null);
      setImageError(null);
      setImageSourceModalVisible(false);
    }
  }, [visible, record]);

  const handlePickImage = async (useCamera = false) => {
    try {
      if (useCamera && !Device.isDevice) {
        showAlert(
          "Camera Not Available",
          "Camera is not supported on the iOS Simulator because it has no physical camera hardware. Please test photo capture on a physical device, or choose 'Gallery' instead.",
        );
        return;
      }

      const permissionMethod = useCamera
        ? ImagePicker.requestCameraPermissionsAsync
        : ImagePicker.requestMediaLibraryPermissionsAsync;

      const { status } = await permissionMethod();
      if (status !== "granted") {
        showAlert(
          "Permission Required",
          `${useCamera ? "Camera" : "Gallery"} permission is required to select proof photo.`,
        );
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
            console.warn("Failed to read image as base64:", e);
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
      showAlert(
        "Upload Error",
        err?.message || "Could not choose image. Please try again.",
      );
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
    setImageBase64(null);
  };

  const handleSubmit = () => {
    let hasError = false;

    if (!remark.trim()) {
      setRemarkError("Remark is required. Please explain the reason.");
      hasError = true;
    } else {
      setRemarkError(null);
    }

    if (!imageUri || !imageBase64) {
      setImageError("Proof image is required. Please attach a photo.");
      hasError = true;
    } else {
      setImageError(null);
    }

    if (hasError) return;

    onSubmit({
      type: selectedType,
      remark: remark.trim(),
      image: imageBase64!,
    });
  };

  return {
    selectedType,
    setSelectedType,
    remark,
    setRemark,
    imageUri,
    imageBase64,
    remarkError,
    setRemarkError,
    imageError,
    imageSourceModalVisible,
    setImageSourceModalVisible,
    genericAlert,
    dismissAlert,
    handlePickImage,
    handleRemoveImage,
    handleSubmit,
  };
}
