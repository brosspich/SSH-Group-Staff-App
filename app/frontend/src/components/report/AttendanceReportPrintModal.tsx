import { AttendanceRecord } from "@/app/(tabs)/attendance";
import CustomAttendancePaper from "@/components/report/CustomAttendancePaper";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import {
  AttendanceSummary,
  ReportMode,
  ReportType,
} from "@/hooks/useAttendanceReportData";
import { StaffUser } from "@/services/userService";
import {
  isNativePrintBusy,
  safePrintAsync,
  safePrintToFileAsync,
} from "@/utils/printGuard";
import { printHtmlOnWeb } from "@/utils/webPrintHelper";
import { MaterialIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { buildTotalAttendanceHtml } from "./BuildTotalAttendanceHtml";

interface AttendanceReportPrintModalProps {
  visible: boolean;
  periodLabel: string;
  reportType: ReportType;
  reportMode: ReportMode;
  summary: AttendanceSummary;
  records: AttendanceRecord[];
  targetStaff?: StaffUser | null;
  onClose: () => void;
  isMobile?: boolean;
}

export function AttendanceReportPrintModal({
  visible,
  periodLabel,
  reportType,
  reportMode,
  summary,
  records,
  targetStaff,
  onClose,
  isMobile = false,
}: AttendanceReportPrintModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSavingPdf, setIsSavingPdf] = useState(false);
  const isProcessingRef = useRef(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      setIsPrinting(false);
      setIsSavingPdf(false);
      isProcessingRef.current = false;
    }
  }, [visible]);

  const getHtml = (): string => {
    return buildTotalAttendanceHtml(
      periodLabel,
      summary,
      records,
      reportType,
      reportMode,
      targetStaff,
    );
  };

  const handlePrint = async (): Promise<void> => {
    if (
      isPrinting ||
      isSavingPdf ||
      isProcessingRef.current ||
      isNativePrintBusy()
    ) {
      return;
    }

    const html = getHtml();
    if (!html) return;

    if (Platform.OS === "web") {
      isProcessingRef.current = true;
      onClose();
      printHtmlOnWeb(html);
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1000);
      return;
    }

    isProcessingRef.current = true;
    setIsPrinting(true);
    onClose();

    setTimeout(async () => {
      try {
        await safePrintAsync({ html });
      } catch (e: any) {
        console.error("Print error:", e?.message);
      } finally {
        setIsPrinting(false);
        isProcessingRef.current = false;
      }
    }, 350);
  };

  const handleSavePDF = async (): Promise<void> => {
    if (
      isPrinting ||
      isSavingPdf ||
      isProcessingRef.current ||
      isNativePrintBusy()
    ) {
      return;
    }

    const html = getHtml();
    if (!html) return;

    if (Platform.OS === "web") {
      onClose();
      printHtmlOnWeb(html);
      return;
    }

    isProcessingRef.current = true;
    setIsSavingPdf(true);

    try {
      const printResult = await safePrintToFileAsync({ html });
      if (!printResult) {
        setIsSavingPdf(false);
        isProcessingRef.current = false;
        return;
      }

      const { uri } = printResult;
      const safePeriod = periodLabel
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[/\\:*?"<>|]/g, "-");
      const timestamp = Date.now();
      const filename = `Attendance_Report_${reportMode}_${reportType}_${safePeriod}_${timestamp}.pdf`;
      const cacheDir =
        FileSystem.cacheDirectory || FileSystem.documentDirectory || "";
      const dest = cacheDir + filename;

      let shareTarget = uri;
      try {
        await FileSystem.copyAsync({ from: uri, to: dest });
        shareTarget = dest;
      } catch (e: any) {
        console.warn("PDF copyAsync fallback to uri:", e?.message);
      }

      onClose();
      setTimeout(async () => {
        try {
          let Sharing: any = null;
          try {
            Sharing = require("expo-sharing/build/Sharing");
          } catch (e) {}

          if (Sharing && typeof Sharing.isAvailableAsync === "function") {
            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
              await Sharing.shareAsync(shareTarget, {
                mimeType: "application/pdf",
                dialogTitle: filename,
                UTI: "com.adobe.pdf",
              });
            }
          }
        } catch (shareErr: any) {
          console.error("Share PDF error:", shareErr?.message);
        } finally {
          setIsSavingPdf(false);
          isProcessingRef.current = false;
        }
      }, 350);
    } catch (e: any) {
      console.error("Save PDF error:", e?.message);
      setIsSavingPdf(false);
      isProcessingRef.current = false;
    }
  };

  return (
    <Modal
      visible={visible}
      statusBarTranslucent
      animationType={isMobile ? "slide" : "fade"}
      transparent
      onRequestClose={onClose}
    >
      <StatusBar barStyle={"light-content"} />
      <View
        style={[
          s.overlay,
          {
            justifyContent: !isMobile ? "center" : "flex-end",
            alignItems: !isMobile ? "center" : "stretch",
            padding: !isMobile ? 16 : 0,
          },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            s.container,
            {
              maxWidth: !isMobile ? "55%" : "100%",
              width: !isMobile ? "55%" : "100%",
              borderRadius: !isMobile ? 20 : 0,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            },
            isMobile && { paddingBottom: insets.bottom },
          ]}
        >
          {/* Header */}
          <View style={s.header}>
            <Text style={s.title} numberOfLines={1} ellipsizeMode="tail">
              Print Report — {reportType} (
              {reportMode === "individual"
                ? targetStaff?.name || "Individual"
                : reportMode === "current"
                  ? targetStaff?.name || "Current Staff"
                  : "All Staff"}
              )
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={s.close}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Preview */}
          <View style={s.previewContainer}>
            <ScrollView
              style={s.previewScroll}
              contentContainerStyle={s.previewContent}
              showsVerticalScrollIndicator={false}
            >
              <CustomAttendancePaper
                periodLabel={periodLabel}
                reportType={reportType}
                reportMode={reportMode}
                summary={summary}
                records={records}
                targetStaff={targetStaff}
              />
            </ScrollView>
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <TouchableOpacity
              style={[s.pdfBtn, (isSavingPdf || isPrinting) && s.btnDisabled]}
              onPress={handleSavePDF}
              disabled={isSavingPdf || isPrinting}
            >
              {isSavingPdf ? (
                <ActivityIndicator size="small" color={AppColors.secondary} />
              ) : (
                <MaterialIcons
                  name="picture-as-pdf"
                  size={18}
                  color={AppColors.secondary}
                />
              )}
              <Text style={s.pdfBtnText}>
                {isSavingPdf ? "Saving…" : "Save PDF"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.printBtn, (isSavingPdf || isPrinting) && s.btnDisabled]}
              onPress={handlePrint}
              disabled={isSavingPdf || isPrinting}
            >
              {isPrinting ? (
                <ActivityIndicator color={AppColors.background2} size="small" />
              ) : (
                <MaterialIcons
                  name="print"
                  size={17}
                  color={AppColors.background2}
                />
              )}
              <Text style={s.printBtnText}>
                {isPrinting ? "Printing…" : "Print"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  container: {
    backgroundColor: AppColors.background2,
    height: "88%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: AppColors.grey + 70,
  },
  title: {
    flex: 1,
    marginRight: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  close: {
    fontSize: 18,
    color: AppColors.textPrimary,
    padding: 4,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  previewScroll: {
    flex: 1,
  },
  previewContent: {
    flexGrow: 1,
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderTopWidth: 0.5,
    borderColor: AppColors.grey,
    alignItems: "center",
  },
  pdfBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: AppColors.secondary,
  },
  pdfBtnText: {
    fontSize: 14,
    color: AppColors.secondary,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  printBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    backgroundColor: AppColors.secondary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: AppColors.secondary,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  printBtnText: {
    fontSize: 14,
    fontWeight: "bold",
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
