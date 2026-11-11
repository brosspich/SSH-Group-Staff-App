import { useLanguage } from "@/features/language";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { theme } from "@/shared/styles/theme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PP_OFFSET_MS = 7 * 60 * 60 * 1000;

function getPPNow() {
  return new Date(Date.now() + PP_OFFSET_MS);
}

function ppMidnightUTC(y: number, mo: number, d: number): Date {
  return new Date(Date.UTC(y, mo, d) - PP_OFFSET_MS);
}

const WEEKDAYS_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const WEEKDAYS_KM = ["អា", "ច", "អ", "ព", "ព្រ", "សុ", "ស"];

const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTHS_KM = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];

interface Props {
  visible: boolean;
  value: Date;
  onClose: () => void;
  onChange: (date: Date) => void;
  allowFuture?: boolean;
}

export default function DatePickerModal({
  visible,
  value,
  onClose,
  onChange,
  allowFuture = false,
}: Props) {
  const { t, isKhmer } = useLanguage();
  const weekdays = isKhmer ? WEEKDAYS_KM : WEEKDAYS_EN;
  const months = isKhmer ? MONTHS_KM : MONTHS_EN;

  const pp = getPPNow();
  const todayY = pp.getUTCFullYear();
  const todayMo = pp.getUTCMonth();
  const todayD = pp.getUTCDate();

  const valuePP = new Date(value.getTime() + PP_OFFSET_MS);
  const [viewYear, setViewYear] = useState(valuePP.getUTCFullYear());
  const [viewMonth, setViewMonth] = useState(valuePP.getUTCMonth());

  const [prevVisible, setPrevVisible] = useState(visible);
  const [prevValue, setPrevValue] = useState(value);

  if (visible !== prevVisible || value !== prevValue) {
    setPrevVisible(visible);
    setPrevValue(value);
    if (visible) {
      setViewYear(valuePP.getUTCFullYear());
      setViewMonth(valuePP.getUTCMonth());
    }
  }

  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsive();

  const firstDow = new Date(Date.UTC(viewYear, viewMonth, 1)).getUTCDay();
  const daysInMonth = new Date(
    Date.UTC(viewYear, viewMonth + 1, 0),
  ).getUTCDate();

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  };

  const isNextDisabled =
    !allowFuture &&
    (viewYear > todayY || (viewYear === todayY && viewMonth >= todayMo));

  const nextMonth = () => {
    if (isNextDisabled) return;
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  };

  const isFuture = (day: number) =>
    !allowFuture &&
    (viewYear > todayY ||
      (viewYear === todayY && viewMonth > todayMo) ||
      (viewYear === todayY && viewMonth === todayMo && day > todayD));

  const isSelected = (day: number) => {
    const d = ppMidnightUTC(viewYear, viewMonth, day);
    return d.getTime() === value.getTime();
  };

  const isToday = (day: number) =>
    viewYear === todayY && viewMonth === todayMo && day === todayD;

  const select = (day: number) => {
    const d = ppMidnightUTC(viewYear, viewMonth, day);
    onChange(d);
  };

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
          s.backdrop,
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
            !isMobile ? s.sheetDesktop : { paddingBottom: insets.bottom + 16 },
          ]}
        >
          {/* Top Header */}
          <View style={s.topHeader}>
            <Text style={s.topHeaderTitle}>{t("common.selectDate")}</Text>
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

          {/* Month Nav */}
          <View style={s.nav}>
            <TouchableOpacity
              onPress={prevMonth}
              style={s.navBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={theme.colors.textPrimary}
              />
            </TouchableOpacity>
            <Text style={s.monthLabel}>
              {months[viewMonth]} {viewYear}
            </Text>
            <TouchableOpacity
              onPress={nextMonth}
              style={[s.navBtn, isNextDisabled && s.navBtnDisabled]}
              disabled={isNextDisabled}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isNextDisabled ? "#d1d5db" : theme.colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          {/* Weekday headers */}
          <View style={s.weekRow}>
            {weekdays.map((w) => (
              <Text key={w} style={s.weekDay}>
                {w}
              </Text>
            ))}
          </View>

          {/* Days grid */}
          <View style={s.grid}>
            {cells.map((day, i) => {
              if (!day) return <View key={`e-${i}`} style={s.cell} />;
              const future = isFuture(day);
              const selected = isSelected(day);
              const today = isToday(day);
              return (
                <TouchableOpacity
                  key={`d-${day}`}
                  style={[s.cell, selected && s.cellSelected]}
                  onPress={() => select(day)}
                  disabled={future}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      s.dayText,
                      today && !selected && s.todayText,
                      selected && s.selectedText,
                      future && s.disabledText,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Confirm button */}
          <TouchableOpacity
            style={s.confirmBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={s.confirmText}>{t("common.done")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  backdropDismiss: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    backgroundColor: "#f8fafc",
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sheetDesktop: {
    borderRadius: theme.borderRadius.xl,
    width: 400,
    maxWidth: "100%",
    paddingBottom: 24,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    marginBottom: 8,
  },
  topHeaderTitle: {
    fontSize: theme.fontSizes.md,
    // fontWeight: "600",
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  closeBtn: { padding: 4 },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  navBtnDisabled: {
    backgroundColor: "#f9fafb",
    borderColor: "#f3f4f6",
  },
  monthLabel: {
    fontSize: theme.fontSizes.lg,
    // fontWeight: "700",
    color: "#111827",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  weekDay: {
    flex: 1,
    textAlign: "center",
    fontSize: theme.fontSizes.sm,
    color: "#6b7280",
    // fontWeight: "700",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  cell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  cellSelected: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.lg,
  },
  dayText: {
    fontSize: theme.fontSizes.md,
    color: "#1f2937",
    // fontWeight: "500",
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  todayText: {
    // fontWeight: "700",
    color: theme.colors.secondary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  selectedText: {
    color: theme.colors.background2,
    // fontWeight: "700",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  disabledText: {
    color: "#d1d5db",
  },
  confirmBtn: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  confirmText: {
    fontSize: theme.fontSizes.md,
    // fontWeight: "600",
    color: theme.colors.background2,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
