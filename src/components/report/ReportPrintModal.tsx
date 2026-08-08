// components/report/ReportPrintModal.tsx

import {
  loadReportPaperSettings,
  type ReportPaperSettings,
} from "@/app/create/custom_report_paper";
import CustomReportPaper from "@/components/report/CustomReportPaper";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { type OrderRow, type Summary } from "@/hooks/useReportData";
import {
  isNativePrintBusy,
  safePrintAsync,
  safePrintToFileAsync,
} from "@/utils/printGuard";
import { MaterialIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { buildHtml } from "./Buildhtml";

import { printHtmlOnWeb } from "@/utils/webPrintHelper";

interface ReportPrintModalProps {
  visible: boolean;
  periodLabel: string;
  reportType: "Daily" | "Weekly" | "Monthly" | "Annual";
  summary: Summary | null;
  orders: OrderRow[];
  onClose: () => void;
  isMobile?: boolean;
}

export const ReportPrintModal: React.FC<ReportPrintModalProps> = ({
  visible,
  periodLabel,
  reportType,
  summary,
  orders,
  onClose,
  isMobile = false,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSavingPdf, setIsSavingPdf] = useState(false);
  const [paperSettings, setPaperSettings] =
    useState<ReportPaperSettings | null>(null);
  const isProcessingRef = useRef(false);

  // Load saved settings whenever modal opens
  useEffect(() => {
    if (visible) {
      setIsPrinting(false);
      setIsSavingPdf(false);
      isProcessingRef.current = false;
      loadReportPaperSettings().then(setPaperSettings);
    }
  }, [visible]);

  const getHtml = (): string => {
    if (!summary) return "";
    return buildHtml(
      periodLabel,
      summary,
      orders,
      reportType,
      paperSettings ?? undefined,
    );
  };

  // ── handlePrint ──────────────────────────────────────────────────────────────
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

  // ── handleSavePDF ────────────────────────────────────────────────────────────
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
      const safeName = (paperSettings?.companyName ?? "Report")
        .trim()
        .replace(/\s+/g, "-");
      const safePeriod = periodLabel
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[/\\:*?"<>|]/g, "-");
      const timestamp = Date.now();
      const filename = `${safeName}-${safePeriod}-Sale_Report_${timestamp}.pdf`;
      const dest = (FileSystem as any).cacheDirectory + filename;

      let shareTarget = uri;
      try {
        await (FileSystem as any).copyAsync({ from: uri, to: dest });
        shareTarget = dest;
      } catch (e: any) {
        console.warn("PDF copyAsync fallback to uri:", e?.message);
      }

      onClose();
      setTimeout(async () => {
        try {
          const canShare = await Sharing.isAvailableAsync();
          if (canShare) {
            await Sharing.shareAsync(shareTarget, {
              mimeType: "application/pdf",
              dialogTitle: filename,
              UTI: "com.adobe.pdf",
            });
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

  const insets = useSafeAreaInsets();

  return (
    // <SafeAreaView style={{ flex: 1 }}>
    <>
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
            },
          ]}
        >
          <View
            style={[
              s.container,
              {
                maxWidth: !isMobile ? "43%" : "100%",
                width: !isMobile ? "43%" : "100%",
                borderBottomLeftRadius: !isMobile ? 20 : 0,
                borderBottomRightRadius: !isMobile ? 20 : 0,
              },
              isMobile && { paddingBottom: insets.bottom },
            ]}
          >
            {/* Header */}
            <View style={s.header}>
              <Text style={s.title}>Print Report</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={s.close}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Preview */}
            <View
              style={[
                s.previewContainer,
                // { height: !isMobile ? "80%" : "87%" },
              ]}
            >
              <ScrollView
                style={s.previewScroll}
                contentContainerStyle={s.previewContent}
                showsVerticalScrollIndicator={false}
              >
                {summary ? (
                  <CustomReportPaper
                    periodLabel={periodLabel}
                    reportType={reportType}
                    summary={summary}
                    orders={orders}
                    settings={paperSettings ?? undefined}
                  />
                ) : (
                  <ActivityIndicator
                    style={{ margin: 32 }}
                    color={AppColors.secondary}
                  />
                )}
              </ScrollView>
            </View>

            {/* Footer */}
            <View style={s.footer}>
              {/* <TouchableOpacity style={s.skipBtn} onPress={onClose}>
                <Text style={s.skipText}>Cancel</Text>
              </TouchableOpacity> */}

              <TouchableOpacity
                style={[s.pdfBtn, (isSavingPdf || isPrinting) && s.btnDisabled]}
                onPress={handleSavePDF}
                disabled={isSavingPdf || isPrinting || !summary}
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
                style={[
                  s.printBtn,
                  (isSavingPdf || isPrinting) && s.btnDisabled,
                ]}
                onPress={handlePrint}
                disabled={isSavingPdf || isPrinting || !summary}
              >
                {isPrinting ? (
                  <ActivityIndicator
                    color={AppColors.background2}
                    size="small"
                  />
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
    </>
    // </SafeAreaView>
  );
};

const SCREEN_H = Dimensions.get("window").height;

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  container: {
    backgroundColor: AppColors.background2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "87%",
    // flexDirection: "column",
    // justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  close: {
    fontSize: 16,
    color: AppColors.textPrimary,
    padding: 4,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    // height: 450,
    // height: SCREEN_H * 0.7,
  },
  previewScroll: {
    flex: 1,
  },
  previewContent: {
    flexGrow: 1,
  },

  footer: {
    flexDirection: "row",
    gap: 8,
    padding: 16,
    borderTopWidth: 0.5,
    borderColor: AppColors.grey,
    alignItems: "center",
  },
  pdfBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1.5,
    borderColor: AppColors.secondary,
    // backgroundColor: AppColors.secondary + "30",
  },
  pdfBtnText: {
    fontSize: 14,
    color: AppColors.secondary,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  skipBtn: {
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 15,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: AppColors.secondary,
  },
  skipText: {
    fontSize: 14,
    color: AppColors.secondary,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  printBtn: {
    flex: 2,
    flexDirection: "row",
    gap: 6,
    backgroundColor: AppColors.secondary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
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
