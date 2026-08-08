import PrinterBluetooth from "@/components/printer/PrinterBluetooth";
import PrinterUSB from "@/components/printer/PrinterUSB";
import PrinterWifi from "@/components/printer/PrinterWifi";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { DiscoveredPrinter, loadAnySavedPrinter } from "@/hooks/usePrinter";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles as globalStyles } from "../../styles/auth.styles";

interface PrinterSelectorModalProps {
  visible: boolean;
  printers?: DiscoveredPrinter[];
  isDiscovering?: boolean;
  selectedPrinter?: DiscoveredPrinter | null;
  onSelectPrinter: (printer: DiscoveredPrinter | null) => void | Promise<void>;
  onClose: () => void;
  onRefresh?: () => void;
  isMobile?: boolean;
}

type ConnectionTab = "bluetooth" | "wifi" | "usb";

interface TabConfig {
  key: ConnectionTab;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const TABS: TabConfig[] = [
  { key: "bluetooth", label: "Bluetooth", icon: "bluetooth" },
  { key: "wifi", label: "Wi-Fi", icon: "wifi" },
  ...(Platform.OS === "android"
    ? [{ key: "usb" as ConnectionTab, label: "USB", icon: "usb" as const }]
    : []),
];

export const PrinterSelectorModal: React.FC<PrinterSelectorModalProps> = ({
  visible,
  onSelectPrinter,
  onClose,
  isMobile = false,
}) => {
  const [activeTab, setActiveTab] = useState<ConnectionTab>("bluetooth");
  const insets = useSafeAreaInsets();

  const handleClose = async () => {
    try {
      const saved = await loadAnySavedPrinter();
      await onSelectPrinter(saved);
    } catch (_) {}
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType={isMobile ? "slide" : "fade"}
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View
        style={[
          globalStyles.modalOverlay,
          {
            justifyContent: !isMobile ? "center" : "flex-end",
            alignItems: !isMobile ? "center" : "stretch",
          },
        ]}
      >
        <View
          style={[
            globalStyles.modalContainer,
            {
              maxHeight: "80%",
              height: "80%",
              maxWidth: !isMobile ? 500 : "100%",
              width: !isMobile ? 500 : "100%",
              borderBottomLeftRadius: !isMobile ? 20 : 0,
              borderBottomRightRadius: !isMobile ? 20 : 0,
              paddingBottom: isMobile ? 16 + insets.bottom : 16,
              paddingHorizontal: 0,
              paddingTop: 0,
              overflow: "hidden",
            },
          ]}
        >
          {/* Header */}
          <View
            style={[
              globalStyles.modalHeader,
              {
                paddingHorizontal: 16,
                paddingTop: 16,
                // backgroundColor: AppColors.background2,
              },
            ]}
          >
            <Text style={globalStyles.modalTitle}>Scan Printer Device</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={globalStyles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* ── Tab bar (cloned from scan_printer.tsx) ── */}
          <View style={styles.tabBar}>
            <View style={styles.tabBarCon}>
              {TABS.map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.tab, active && styles.tabActive]}
                    onPress={() => setActiveTab(tab.key)}
                    activeOpacity={0.75}
                  >
                    <MaterialIcons
                      name={tab.icon}
                      size={18}
                      color={
                        active ? AppColors.background2 : AppColors.textSecondary
                      }
                    />
                    <Text
                      style={[styles.tabLabel, active && styles.tabLabelActive]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Keep all tabs mounted, just hide inactive ones ── */}
          <View style={{ flex: 1, width: "100%" }}>
            <View
              style={[
                styles.content,
                { display: activeTab === "bluetooth" ? "flex" : "none" },
              ]}
            >
              <PrinterBluetooth />
            </View>
            <View
              style={[
                styles.content,
                { display: activeTab === "usb" ? "flex" : "none" },
              ]}
            >
              <PrinterUSB />
            </View>
            <View
              style={[
                styles.content,
                { display: activeTab === "wifi" ? "flex" : "none" },
              ]}
            >
              <PrinterWifi />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  /* Tab bar */
  tabBar: {
    backgroundColor: AppColors.background,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
    alignItems: "center",
    paddingHorizontal: 10,
    // paddingVertical: 10,
    paddingBottom: 10,
  },
  tabBarCon: {
    flexDirection: "row",
    backgroundColor: AppColors.background2,
    borderRadius: 12,
    padding: 4,
    width: "100%",
    justifyContent: "space-between",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: AppColors.secondary,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: AppColors.textSecondary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  tabLabelActive: {
    color: AppColors.background2,
  },

  /* Content area */
  content: {
    flex: 1,
  },
});
