import { useLanguage } from "@/features/language";
import CustomRequestPaper from "@/shared/components/report-request/CustomRequestPaper";
import {
  ReportMode,
  ReportType,
  RequestSummary,
} from "@/shared/hooks/useAttendanceRequestReportData";
import { AttendanceRequestRuleItem } from "@/shared/services/attendanceRequestService";
import { StaffUser } from "@/shared/services/userService";
import { theme } from "@/shared/styles/theme";
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
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { buildTotalRequestHtml } from "./BuildTotalRequestHtml";

interface RequestReportPrintModalProps {
  visible: boolean;
  periodLabel: string;
  reportType: ReportType;
  reportMode: ReportMode;
  summary: RequestSummary;
  records: AttendanceRequestRuleItem[];
  targetStaff?: StaffUser | null;
  onClose: () => void;
  isMobile?: boolean;
}

export function RequestReportPrintModal({
  visible,
  periodLabel,
  reportType,
  reportMode,
  summary,
  records,
  targetStaff,
  onClose,
  isMobile = false,
}: RequestReportPrintModalProps) {
  const { t } = useLanguage();
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
    return buildTotalRequestHtml(
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
      const filename = `Request_Report_${reportMode}_${reportType}_${safePeriod}_${timestamp}.pdf`;
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
              <CustomRequestPaper
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
                <ActivityIndicator
                  size="small"
                  color={theme.colors.secondary}
                />
              ) : (
                <MaterialIcons
                  name="picture-as-pdf"
                  size={18}
                  color={theme.colors.secondary}
                />
              )}
              <Text style={s.pdfBtnText}>
                {isSavingPdf ? t("report.saving") : t("report.savePdf")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.printBtn, (isSavingPdf || isPrinting) && s.btnDisabled]}
              onPress={handlePrint}
              disabled={isSavingPdf || isPrinting}
            >
              {isPrinting ? (
                <ActivityIndicator
                  color={theme.colors.background2}
                  size="small"
                />
              ) : (
                <MaterialIcons
                  name="print"
                  size={17}
                  color={theme.colors.background2}
                />
              )}
              <Text style={s.printBtnText}>
                {isPrinting ? t("report.printing") : t("report.print")}
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
    backgroundColor: theme.colors.background2,
    height: "88%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.grey + 70,
  },
  title: {
    flex: 1,
    marginRight: 10,
    fontSize: theme.fontSizes.md,
    // fontWeight: "bold",
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  close: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textPrimary,
    padding: 4,
    fontFamily: theme.fonts.regular,
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
    borderColor: theme.colors.grey,
    alignItems: "center",
  },
  pdfBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.secondary,
  },
  pdfBtnText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.secondary,
    // fontWeight: "bold",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  printBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: theme.colors.secondary,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  printBtnText: {
    fontSize: theme.fontSizes.sm,
    // fontWeight: "bold",
    color: theme.colors.background2,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
