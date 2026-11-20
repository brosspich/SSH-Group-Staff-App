import { useLanguage } from "@/features/language";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { theme } from "@/shared/styles/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { DeviceSession } from "../_types/devices.types";
import {
  formatDateTimeWithAgo,
  formatLastActive,
} from "../_utils/devicesDateUtils";
import DeviceOSIcon from "./DeviceOSIcon";

interface DeviceDetailModalProps {
  visible: boolean;
  selectedSession: DeviceSession | null;
  currentSessionId: string | null;
  onClose: () => void;
  onTerminate: (sessionId: string) => void;
}

export default function DeviceDetailModal({
  visible,
  selectedSession,
  currentSessionId,
  onClose,
  onTerminate,
}: DeviceDetailModalProps) {
  const { t } = useLanguage();
  const { isMobile } = useResponsive();
  const insets = useSafeAreaInsets();

  if (!selectedSession) return null;

  const statusText = formatLastActive(selectedSession.last_active);
  const isCurrentDevice = selectedSession.id === currentSessionId;

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isMobile ? "slide" : "fade"}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        style={[
          styles.modalOverlay,
          {
            justifyContent: !isMobile ? "center" : "flex-end",
            alignItems: !isMobile ? "center" : "stretch",
            // maxHeight: !isMobile ? "100%" : "80%",
          },
        ]}
      >
        <View
          style={[
            styles.modalSheet,
            {
              maxHeight: "90%",
              maxWidth: !isMobile ? 480 : "100%",
              width: !isMobile ? 480 : "100%",
              borderBottomLeftRadius: !isMobile ? 20 : 0,
              borderBottomRightRadius: !isMobile ? 20 : 0,
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}
        >
          <ScrollView
            style={{ flexShrink: 1 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Centered Large Icon & Device Name */}
            <View style={styles.modalHeaderContainer}>
              <DeviceOSIcon
                os={selectedSession.os}
                deviceName={selectedSession.device_name}
                modelName={selectedSession.model_name}
                isLarge={true}
                deviceType={selectedSession.device_type}
              />
              <Text style={styles.modalDeviceName}>
                {selectedSession.device_name}
              </Text>
              <Text style={styles.modalStatusTime}>
                {statusText === "online" ? (
                  <Text style={styles.onlineColor}>online</Text>
                ) : (
                  statusText
                )}
              </Text>
            </View>

            {/* Modal details list */}
            <View style={styles.modalList}>
              {/* Row 1: Application / Model Name */}
              <View style={styles.modalRow}>
                <View style={styles.modalIconBox}>
                  <MaterialCommunityIcons
                    name="laptop"
                    size={22}
                    color={theme.colors.textSecondary}
                  />
                </View>
                <View style={styles.modalRowText}>
                  <Text style={styles.modalRowTitle}>
                    {selectedSession.browser_name
                      ? `${selectedSession.browser_name} ${selectedSession.browser_version || ""}`
                      : selectedSession.model_name ||
                        `SSH Group POS ${selectedSession.os} ${selectedSession.app_version || (selectedSession as any).appVersion || "1.0.1.20311"}`}
                  </Text>
                  <Text style={styles.modalRowSub}>
                    {selectedSession.browser_name
                      ? "Web Browser"
                      : t("devices.modelName")}
                  </Text>
                </View>
              </View>
              <View style={styles.modalRowDivider} />

              {/* Row 2: OS & Model Number */}
              <View style={styles.modalRow}>
                <View style={styles.modalIconBox}>
                  <Ionicons
                    name="information-circle-outline"
                    size={22}
                    color={theme.colors.textSecondary}
                  />
                </View>
                <View style={styles.modalRowText}>
                  <Text style={styles.modalRowTitle}>
                    {`${selectedSession.os} ${selectedSession.os_version} ${selectedSession.model_number ? "• " + selectedSession.model_number : ""}`}
                  </Text>
                  <Text style={styles.modalRowSub}>
                    {t("devices.systemModel")}
                  </Text>
                </View>
              </View>
              <View style={styles.modalRowDivider} />

              {/* Row 3: Location */}
              <View style={styles.modalRow}>
                <View style={styles.modalIconBox}>
                  <Ionicons
                    name="location-outline"
                    size={22}
                    color={theme.colors.textSecondary}
                  />
                </View>
                <View style={styles.modalRowText}>
                  <Text style={styles.modalRowTitle}>
                    {selectedSession.location}
                  </Text>
                  <Text style={styles.modalRowSub}>
                    {`IP: ${selectedSession.ip_address || "Unknown"}`}
                  </Text>
                </View>
              </View>
              <View style={styles.modalRowDivider} />

              {/* Row 4: Initial Login Time (loginTimed) */}
              {(selectedSession.login_timed ||
                selectedSession.loginTimed ||
                (selectedSession as any).first_login) && (
                <>
                  <View style={styles.modalRow}>
                    <View style={styles.modalIconBox}>
                      <Ionicons
                        name="calendar-outline"
                        size={22}
                        color={theme.colors.textSecondary}
                      />
                    </View>
                    <View style={styles.modalRowText}>
                      <Text style={styles.modalRowTitle}>
                        {formatDateTimeWithAgo(
                          selectedSession.login_timed ||
                            selectedSession.loginTimed ||
                            (selectedSession as any).first_login,
                        )}
                      </Text>
                      <Text style={styles.modalRowSub}>
                        {t("devices.firstLogin")}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.modalRowDivider} />
                </>
              )}

              {/* Row 5: Last Login */}
              {selectedSession.last_login && (
                <>
                  <View style={styles.modalRow}>
                    <View style={styles.modalIconBox}>
                      <Ionicons
                        name="log-in-outline"
                        size={22}
                        color={theme.colors.textSecondary}
                      />
                    </View>
                    <View style={styles.modalRowText}>
                      <Text style={styles.modalRowTitle}>
                        {formatDateTimeWithAgo(selectedSession.last_login)}
                      </Text>
                      <Text style={styles.modalRowSub}>
                        {t("devices.lastLogin")}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.modalRowDivider} />
                </>
              )}

              {/* Row 6: Last Use Time */}
              {(selectedSession.last_use_time ||
                selectedSession.last_active) && (
                <>
                  <View style={styles.modalRow}>
                    <View style={styles.modalIconBox}>
                      <Ionicons
                        name="time-outline"
                        size={22}
                        color={theme.colors.textSecondary}
                      />
                    </View>
                    <View style={styles.modalRowText}>
                      <Text style={styles.modalRowTitle}>
                        {(() => {
                          const raw =
                            selectedSession.last_use_time ||
                            selectedSession.last_active;
                          const d = raw ? new Date(raw) : null;
                          const diffMs =
                            d && !isNaN(d.getTime())
                              ? Date.now() - d.getTime()
                              : Infinity;
                          const isOnline =
                            diffMs < 120 * 1000 && diffMs > -120 * 1000;
                          if (isOnline) {
                            return (
                              <Text style={styles.onlineColor}>
                                {t("common.online")}
                              </Text>
                            );
                          }
                          return formatDateTimeWithAgo(raw);
                        })()}
                      </Text>
                      <Text style={styles.modalRowSub}>
                        {t("devices.lastActive")}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.modalRowDivider} />
                </>
              )}
            </View>
          </ScrollView>

          <View style={styles.conBtn}>
            {isCurrentDevice ? (
              <TouchableOpacity
                style={[
                  styles.terminateBtn,
                  {
                    backgroundColor: theme.colors.background2,
                    borderColor: theme.colors.secondary,
                  },
                ]}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.terminateBtnText,
                    { color: theme.colors.secondary },
                  ]}
                >
                  {t("common.close")}
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.terminateBtn,
                    {
                      backgroundColor: theme.colors.background2,
                      borderColor: theme.colors.secondary,
                    },
                  ]}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.terminateBtnText,
                      { color: theme.colors.secondary },
                    ]}
                  >
                    {t("common.cancel")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.terminateBtn, { flex: 2 }]}
                  onPress={() => onTerminate(selectedSession.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.terminateBtnText}>
                    {t("devices.terminateSession")}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalSheet: {
    backgroundColor: theme.colors.background2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeaderContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalDeviceName: {
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    color: theme.colors.textPrimary,
    marginTop: 12,
    textAlign: "center",
  },
  modalStatusTime: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    marginTop: 4,
  },
  onlineColor: {
    color: theme.colors.success,
    fontFamily: theme.fonts.semibold,
    includeFontPadding: false,
  },
  modalList: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    marginBottom: 20,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  modalIconBox: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  modalRowText: {
    flex: 1,
  },
  modalRowTitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    lineHeight: 20,
  },
  modalRowSub: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },
  modalRowDivider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginLeft: 58,
  },
  conBtn: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  terminateBtn: {
    flex: 1,
    backgroundColor: theme.colors.red,
    height: 48,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.red,
    alignItems: "center",
    justifyContent: "center",
  },
  terminateBtnText: {
    color: theme.colors.background2,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
