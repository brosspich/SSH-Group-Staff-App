import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useResponsive } from "@/hooks/useResponsive";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
}

export default function DatePickerModal({
  visible,
  value,
  onClose,
  onChange,
}: Props) {
  const pp = getPPNow();
  const todayY = pp.getUTCFullYear();
  const todayMo = pp.getUTCMonth();
  const todayD = pp.getUTCDate();

  const valuePP = new Date(value.getTime() + PP_OFFSET_MS);
  const [viewYear, setViewYear] = useState(valuePP.getUTCFullYear());
  const [viewMonth, setViewMonth] = useState(valuePP.getUTCMonth());

  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsive();

  // Reset calendar view to selected date whenever modal opens
  useEffect(() => {
    if (visible) {
      const pp = new Date(value.getTime() + PP_OFFSET_MS);
      setViewYear(pp.getUTCFullYear());
      setViewMonth(pp.getUTCMonth());
    }
  }, [visible]);

  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

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

  const nextMonth = () => {
    if (viewYear > todayY || (viewYear === todayY && viewMonth >= todayMo))
      return;
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  };

  const isFuture = (day: number) =>
    viewYear > todayY ||
    (viewYear === todayY && viewMonth > todayMo) ||
    (viewYear === todayY && viewMonth === todayMo && day > todayD);

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
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            s.sheet,
            {
              maxWidth: !isMobile ? 420 : "100%",
              width: !isMobile ? 420 : "100%",
              borderRadius: 24,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          {/* Header */}
          <View style={s.header}>
            <Text style={s.headerTitle}>Select date</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <MaterialIcons
                name="close"
                size={20}
                color={AppColors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Month nav */}
          <View style={s.nav}>
            <TouchableOpacity onPress={prevMonth} style={s.navBtn}>
              <Ionicons
                name="chevron-back"
                size={16}
                color={AppColors.textSecondary}
              />
            </TouchableOpacity>
            <Text style={s.monthLabel}>
              {MONTHS[viewMonth]} {viewYear}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={s.navBtn}>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={AppColors.textSecondary}
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
          <TouchableOpacity style={s.confirmBtn} onPress={onClose}>
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
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  backdropDismiss: {
    flex: 1,
  },
  sheet: {
    backgroundColor: AppColors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: `${AppColors.textSecondary}33`,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  closeBtn: { padding: 4 },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  navBtn: {
    padding: 6,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: `${AppColors.textSecondary}44`,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  weekRow: { flexDirection: "row", marginBottom: 4 },
  weekDay: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    color: AppColors.textSecondary,
    fontWeight: "600",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  cell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cellSelected: {
    backgroundColor: AppColors.secondary,
    borderRadius: 99,
  },
  dayText: {
    fontSize: 13,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  todayText: {
    fontWeight: "700",
    color: AppColors.secondary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  selectedText: { color: "#fff", fontWeight: "600", fontFamily: AppFonts.bold },
  disabledText: { color: `${AppColors.textSecondary}55` },
  confirmBtn: {
    backgroundColor: AppColors.secondary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  confirmText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
