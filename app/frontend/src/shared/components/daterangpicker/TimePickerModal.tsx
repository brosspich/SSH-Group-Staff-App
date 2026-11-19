import { useLanguage } from "@/features/language";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { theme } from "@/shared/styles/theme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface TimePickerModalProps {
  visible: boolean;
  value: string; // e.g. "08:00 AM" or "05:00 PM"
  onClose: () => void;
  onChange: (time: string) => void;
  useModal?: boolean;
}

function parseTimeString(timeStr?: string) {
  let hour = 8;
  let minute = 0;
  let period: "AM" | "PM" = "AM";

  if (!timeStr) return { hour, minute, period };

  const match = timeStr
    .trim()
    .match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (match) {
    const rawH = parseInt(match[1], 10);
    minute = parseInt(match[2], 10) || 0;
    const p = match[3]?.toUpperCase();

    if (p === "AM" || p === "PM") {
      hour = rawH === 0 ? 12 : rawH > 12 ? rawH - 12 : rawH;
      period = p as "AM" | "PM";
    } else {
      if (rawH >= 12) {
        period = "PM";
        hour = rawH === 12 ? 12 : rawH - 12;
      } else {
        period = "AM";
        hour = rawH === 0 ? 12 : rawH;
      }
    }
  }
  return { hour, minute, period };
}

function formatTimeDisplay(
  hour: number,
  minute: number,
  period: "AM" | "PM",
): string {
  const hStr = String(hour).padStart(2, "0");
  const mStr = String(minute).padStart(2, "0");
  return `${hStr}:${mStr} ${period}`;
}

const PRESET_TIMES = [
  { label: "08:00 AM", sub: "Time-In", h: 8, m: 0, p: "AM" as const },
  { label: "12:00 PM", sub: "Noon", h: 12, m: 0, p: "PM" as const },
  { label: "01:00 PM", sub: "Afternoon", h: 1, m: 0, p: "PM" as const },
  { label: "05:00 PM", sub: "Time-Out", h: 5, m: 0, p: "PM" as const },
];

export default function TimePickerModal({
  visible,
  value,
  onClose,
  onChange,
  useModal = true,
}: TimePickerModalProps) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsive();

  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("AM");

  useEffect(() => {
    if (visible) {
      const parsed = parseTimeString(value);
      setSelectedHour(parsed.hour);
      setSelectedMinute(parsed.minute);
      setSelectedPeriod(parsed.period);
    }
  }, [visible, value]);

  const handleSetCurrentTime = () => {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes();
    const p: "AM" | "PM" = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    setSelectedHour(h);
    setSelectedMinute(m);
    setSelectedPeriod(p);
  };

  const handleAdjustMinute = (delta: number) => {
    setSelectedMinute((curr) => {
      let next = curr + delta;
      if (next < 0) next = 59;
      if (next > 59) next = 0;
      return next;
    });
  };

  const handleConfirm = () => {
    const formatted = formatTimeDisplay(
      selectedHour,
      selectedMinute,
      selectedPeriod,
    );
    onChange(formatted);
    onClose();
  };

  const HOUR_ROWS = [
    [1, 2, 3, 4, 5, 6],
    [7, 8, 9, 10, 11, 12],
  ];

  const MINUTE_ROWS = [
    [0, 5, 10, 15, 20, 25],
    [30, 35, 40, 45, 50, 55],
  ];

  if (!visible) return null;

  const content = (
    <View
      style={[
        s.backdrop,
        !useModal && StyleSheet.absoluteFill,
        !useModal && { zIndex: 1000, elevation: 1000 },
        {
          justifyContent: !isMobile ? "center" : "flex-end",
          alignItems: !isMobile ? "center" : "stretch",
          padding: !isMobile ? 16 : 0,
        },
      ]}
    >
      <TouchableOpacity
        style={s.backdropDismiss}
        onPress={onClose}
        activeOpacity={1}
      />

      <View
        style={[
          s.sheet,
          !isMobile
            ? s.sheetDesktop
            : { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={s.iconBadge}>
              <Ionicons
                name="time-outline"
                size={20}
                color={theme.colors.primary}
              />
            </View>
            <Text style={s.headerTitle}>{t("common.selectTime")}</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={s.closeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons
              name="close"
              size={22}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scrollBody}
        >
          {/* Prominent Time Display & AM/PM Switcher */}
          <View style={s.displayCard}>
            <View style={s.timeDisplayBox}>
              <Text style={s.timeDisplayText}>
                {String(selectedHour).padStart(2, "0")}
                <Text style={s.timeColon}>:</Text>
                {String(selectedMinute).padStart(2, "0")}
              </Text>
            </View>

            <View style={s.periodToggle}>
              <TouchableOpacity
                style={[
                  s.periodBtn,
                  selectedPeriod === "AM" && s.periodBtnActive,
                ]}
                onPress={() => setSelectedPeriod("AM")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    s.periodText,
                    selectedPeriod === "AM" && s.periodTextActive,
                  ]}
                >
                  AM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  s.periodBtn,
                  selectedPeriod === "PM" && s.periodBtnActive,
                ]}
                onPress={() => setSelectedPeriod("PM")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    s.periodText,
                    selectedPeriod === "PM" && s.periodTextActive,
                  ]}
                >
                  PM
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Preset Buttons */}
          <View style={s.presetSection}>
            <Text style={s.sectionTitle}>{t("common.presets")}</Text>
            <View style={s.presetRow}>
              {PRESET_TIMES.map((preset) => {
                const isCurrent =
                  selectedHour === preset.h &&
                  selectedMinute === preset.m &&
                  selectedPeriod === preset.p;
                const presetSubLabel =
                  preset.sub === "Time-In"
                    ? t("attendance.timeInShort")
                    : preset.sub === "Noon"
                      ? t("common.noon")
                      : preset.sub === "Afternoon"
                        ? t("common.afternoon")
                        : t("attendance.timeOutShort");
                return (
                  <TouchableOpacity
                    key={preset.label}
                    style={[s.presetChip, isCurrent && s.presetChipActive]}
                    onPress={() => {
                      setSelectedHour(preset.h);
                      setSelectedMinute(preset.m);
                      setSelectedPeriod(preset.p);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        s.presetChipLabel,
                        isCurrent && s.presetChipLabelActive,
                      ]}
                    >
                      {preset.label}
                    </Text>
                    <Text
                      style={[
                        s.presetChipSub,
                        isCurrent && s.presetChipSubActive,
                      ]}
                    >
                      {presetSubLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={s.presetChipNow}
                onPress={handleSetCurrentTime}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="refresh-outline"
                  size={14}
                  color={theme.colors.primary}
                />
                <Text style={s.presetChipNowText}>{t("common.now")}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hours Selector */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>{t("common.hour")}</Text>
            <View style={s.gridContainer}>
              {HOUR_ROWS.map((row, rowIdx) => (
                <View key={`h-row-${rowIdx}`} style={s.gridRow}>
                  {row.map((h) => {
                    const active = selectedHour === h;
                    return (
                      <TouchableOpacity
                        key={`h-${h}`}
                        style={[s.gridCell, active && s.gridCellActive]}
                        onPress={() => setSelectedHour(h)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            s.gridCellText,
                            active && s.gridCellTextActive,
                          ]}
                        >
                          {String(h).padStart(2, "0")}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>

          {/* Minutes Selector & Steppers */}
          <View style={s.section}>
            <View style={s.sectionHeaderRow}>
              <Text style={s.sectionTitle}>{t("common.minute")}</Text>
              <View style={s.stepperRow}>
                <TouchableOpacity
                  style={s.stepperBtn}
                  onPress={() => handleAdjustMinute(-1)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="remove"
                    size={16}
                    color={theme.colors.textPrimary}
                  />
                </TouchableOpacity>
                <Text style={s.stepperValue}>
                  {String(selectedMinute).padStart(2, "0")}m
                </Text>
                <TouchableOpacity
                  style={s.stepperBtn}
                  onPress={() => handleAdjustMinute(1)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="add"
                    size={16}
                    color={theme.colors.textPrimary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={s.gridContainer}>
              {MINUTE_ROWS.map((row, rowIdx) => (
                <View key={`m-row-${rowIdx}`} style={s.gridRow}>
                  {row.map((m) => {
                    const active = selectedMinute === m;
                    return (
                      <TouchableOpacity
                        key={`m-${m}`}
                        style={[s.gridCell, active && s.gridCellActive]}
                        onPress={() => setSelectedMinute(m)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            s.gridCellText,
                            active && s.gridCellTextActive,
                          ]}
                        >
                          {String(m).padStart(2, "0")}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={s.footer}>
          <TouchableOpacity
            style={s.cancelBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={s.cancelBtnText}>{t("common.cancel")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.confirmBtn}
            onPress={handleConfirm}
            activeOpacity={0.85}
          >
            <Ionicons
              name="checkmark"
              size={18}
              color={theme.colors.background2}
              style={{ marginRight: 6 }}
            />
            <Text style={s.confirmBtnText}>{t("common.setTime")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (!useModal) {
    return content;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isMobile ? "slide" : "fade"}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {content}
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  backdropDismiss: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    backgroundColor: theme.colors.background2,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingTop: 16,
    maxHeight: "85%",
  },
  sheetDesktop: {
    borderRadius: theme.borderRadius.xl,
    width: 440,
    maxWidth: "94%",
    paddingBottom: 20,
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.primary}18`,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textPrimary,
    includeFontPadding: false,
  },
  closeBtn: {
    padding: 6,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  displayCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: `${theme.colors.primary}0D`,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}25`,
    marginBottom: 16,
  },
  timeDisplayBox: {
    flex: 1,
  },
  timeDisplayText: {
    fontSize: 34,
    fontFamily: theme.fonts.bold,
    color: theme.colors.primary,
    letterSpacing: 1,
    includeFontPadding: false,
  },
  timeColon: {
    color: theme.colors.textSecondary,
    fontSize: 30,
  },
  periodToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: theme.borderRadius.md,
    padding: 3,
    gap: 4,
  },
  periodBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9,
  },
  periodBtnActive: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  periodText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textSecondary,
    includeFontPadding: false,
  },
  periodTextActive: {
    color: theme.colors.background2,
  },
  presetSection: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    includeFontPadding: false,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 8,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background2,
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
  },
  stepperValue: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    color: theme.colors.primary,
    includeFontPadding: false,
  },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetChip: {
    backgroundColor: "rgba(0,0,0,0.04)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    alignItems: "center",
  },
  presetChipActive: {
    backgroundColor: `${theme.colors.primary}1A`,
    borderColor: theme.colors.primary,
  },
  presetChipLabel: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textPrimary,
    includeFontPadding: false,
  },
  presetChipLabelActive: {
    color: theme.colors.primary,
  },
  presetChipSub: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    marginTop: 2,
    includeFontPadding: false,
  },
  presetChipSubActive: {
    color: theme.colors.primary,
  },
  presetChipNow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}40`,
    backgroundColor: `${theme.colors.primary}0D`,
  },
  presetChipNowText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    color: theme.colors.primary,
    includeFontPadding: false,
  },
  gridContainer: {
    gap: 6,
    width: "100%",
  },
  gridRow: {
    flexDirection: "row",
    gap: 6,
    width: "100%",
  },
  gridCell: {
    flex: 1,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "rgba(0,0,0,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  gridCellActive: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
  },
  gridCellText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textPrimary,
    includeFontPadding: false,
    textAlign: "center",
    textAlignVertical: "center",
  },
  gridCellTextActive: {
    color: theme.colors.background2,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  cancelBtn: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 12,
    backgroundColor: `${theme.colors.grey}15`,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: `${theme.colors.grey}30`,
  },
  cancelBtnText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textPrimary,
    includeFontPadding: false,
  },
  confirmBtn: {
    flex: 2,
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmBtnText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    color: theme.colors.background2,
    includeFontPadding: false,
  },
});
