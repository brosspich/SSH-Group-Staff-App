import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useResponsive } from "@/hooks/useResponsive";
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

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
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
            <Text style={s.topHeaderTitle}>Select date</Text>
            <TouchableOpacity
              onPress={onClose}
              style={s.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons
                name="close"
                size={22}
                color={AppColors.textSecondary}
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
                color={AppColors.textPrimary}
              />
            </TouchableOpacity>
            <Text style={s.monthLabel}>
              {MONTHS[viewMonth]} {viewYear}
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
                color={isNextDisabled ? "#d1d5db" : AppColors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          {/* Weekday headers */}
          <View style={s.weekRow}>
            {WEEKDAYS.map((w) => (
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
            <Text style={s.confirmText}>Done</Text>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sheetDesktop: {
    borderRadius: 24,
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
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.textSecondary,
    fontFamily: AppFonts.bold,
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
    borderRadius: 12,
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
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  weekDay: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "700",
    fontFamily: AppFonts.bold,
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
    backgroundColor: AppColors.secondary,
    borderRadius: 16,
  },
  dayText: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "500",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  todayText: {
    fontWeight: "700",
    color: AppColors.secondary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  selectedText: {
    color: "#ffffff",
    fontWeight: "700",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  disabledText: {
    color: "#d1d5db",
  },
  confirmBtn: {
    backgroundColor: AppColors.secondary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
