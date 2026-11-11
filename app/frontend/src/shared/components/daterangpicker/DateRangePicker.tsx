import { useLanguage } from "@/features/language";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { theme } from "@/shared/styles/theme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DateRange {
  start: Date;
  end: Date;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onApply: (range: DateRange) => void;
  initialRange?: DateRange;
}

// ─── PP helpers ───────────────────────────────────────────────────────────────

const PP_OFFSET_MS = 7 * 60 * 60 * 1000;

function getPPNow(): Date {
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

// ─── Quick presets ────────────────────────────────────────────────────────────

function getPreset(label: string): DateRange {
  const pp = getPPNow();
  const y = pp.getUTCFullYear(),
    mo = pp.getUTCMonth(),
    d = pp.getUTCDate();
  const end = ppMidnightUTC(y, mo, d + 1); // end of today (exclusive)
  switch (label) {
    case "7 days":
      return { start: ppMidnightUTC(y, mo, d - 6), end };
    case "30 days":
      return { start: ppMidnightUTC(y, mo, d - 29), end };
    case "This month":
      return { start: ppMidnightUTC(y, mo, 1), end };
    default:
      return { start: ppMidnightUTC(y, mo, d), end };
  }
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────

interface CalProps {
  year: number;
  month: number;
  selected: Date | null;
  rangeStart: Date | null;
  rangeEnd: Date | null;
  onSelect: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  showNav?: boolean;
}

function MiniCalendar({
  year,
  month,
  selected,
  rangeStart,
  rangeEnd,
  onSelect,
  onPrevMonth,
  onNextMonth,
  showNav = true,
}: CalProps) {
  const { isKhmer } = useLanguage();
  const weekdays = isKhmer ? WEEKDAYS_KM : WEEKDAYS_EN;
  const months = isKhmer ? MONTHS_KM : MONTHS_EN;

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const pp = getPPNow();
  const todayY = pp.getUTCFullYear(),
    todayMo = pp.getUTCMonth(),
    todayD = pp.getUTCDate();

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <View style={cal.container}>
      {showNav && (
        <View style={cal.nav}>
          <TouchableOpacity onPress={onPrevMonth} style={cal.navBtn}>
            <Ionicons
              name="chevron-back"
              size={16}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
          <Text style={cal.monthLabel}>
            {months[month]} {year}
          </Text>
          <TouchableOpacity onPress={onNextMonth} style={cal.navBtn}>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      )}
      {!showNav && (
        <Text
          style={[cal.monthLabel, { marginBottom: 8, textAlign: "center" }]}
        >
          {months[month]} {year}
        </Text>
      )}

      {/* Weekday headers */}
      <View style={cal.weekRow}>
        {weekdays.map((w) => (
          <Text key={w} style={cal.weekDay}>
            {w}
          </Text>
        ))}
      </View>

      {/* Day grid */}
      <View style={cal.grid}>
        {cells.map((day, i) => {
          if (!day) return <View key={`e-${i}`} style={cal.cell} />;

          const thisDate = ppMidnightUTC(year, month, day);
          const ts = thisDate.getTime();
          const isStart = rangeStart && ts === rangeStart.getTime();
          const isEnd = rangeEnd && ts === rangeEnd.getTime();
          const inRange =
            rangeStart &&
            rangeEnd &&
            ts > rangeStart.getTime() &&
            ts < rangeEnd.getTime();
          const isToday =
            year === todayY && month === todayMo && day === todayD;
          const isSelected = selected && ts === selected.getTime();
          let bg: string = "transparent";
          let textColor: string = theme.colors.textPrimary;
          let radius = 8;

          if (isStart || isEnd || isSelected) {
            bg = theme.colors.secondary;
            textColor = "#ffffff";
            radius = 99;
          } else if (inRange) {
            bg = `${theme.colors.secondary}22`;
            textColor = theme.colors.secondary;
            radius = 0;
          }

          return (
            <TouchableOpacity
              key={`d-${day}`}
              style={[cal.cell, { backgroundColor: bg, borderRadius: radius }]}
              onPress={() => onSelect(thisDate)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  cal.dayText,
                  { color: textColor },
                  isToday && !isStart && !isEnd && !isSelected && cal.todayText,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const cal = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  navBtn: {
    padding: 6,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 0.5,
    borderColor: `${theme.colors.textSecondary}44`,
  },
  monthLabel: {
    fontSize: theme.fontSizes.sm,
    // fontWeight: "600",
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  weekRow: { flexDirection: "row", marginBottom: 4 },
  weekDay: {
    flex: 1,
    textAlign: "center",
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    // fontWeight: "600",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  todayText: {
    // fontWeight: "700",
    color: theme.colors.secondary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});

// ─── DateRangePicker Modal ────────────────────────────────────────────────────

const PRESETS = ["7 days", "30 days", "This month"];

export default function DateRangePicker({
  visible,
  onClose,
  onApply,
  initialRange,
}: Props) {
  const { t, isKhmer } = useLanguage();
  const pp = getPPNow();

  const PRESET_OPTIONS = [
    { id: "7 days", label: t("common.sevenDays") },
    { id: "30 days", label: t("common.thirtyDays") },
    { id: "This month", label: t("common.thisMonth") },
  ];

  const [startDate, setStartDate] = useState<Date | null>(
    initialRange?.start ?? null,
  );
  const [endDate, setEndDate] = useState<Date | null>(
    initialRange?.end ?? null,
  );
  const [selecting, setSelecting] = useState<"start" | "end">("start");

  const [fromYear, setFromYear] = useState(pp.getUTCFullYear());
  const [fromMonth, setFromMonth] = useState(pp.getUTCMonth());
  const [toYear, setToYear] = useState(pp.getUTCFullYear());
  const [toMonth, setToMonth] = useState(pp.getUTCMonth());

  const [activePreset, setActivePreset] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  const { isTablet, isMobile } = useResponsive();

  const handlePreset = (label: string) => {
    const range = getPreset(label);
    setStartDate(range.start);
    setEndDate(range.end);
    setActivePreset(label);
    // navigate calendars
    const s = new Date(range.start.getTime() + PP_OFFSET_MS);
    setFromYear(s.getUTCFullYear());
    setFromMonth(s.getUTCMonth());
    const e = new Date(range.end.getTime() + PP_OFFSET_MS);
    setToYear(e.getUTCFullYear());
    setToMonth(e.getUTCMonth());
  };

  const handleDayPress = (date: Date) => {
    setActivePreset(null);
    if (selecting === "start") {
      setStartDate(date);
      setEndDate(null);
      setSelecting("end");
    } else {
      if (startDate && date.getTime() < startDate.getTime()) {
        // user picked end before start → swap
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
      setSelecting("start");
    }
  };

  const handleApply = () => {
    if (!startDate || !endDate) return;
    // end is inclusive: add 1 day so we get everything on that day
    const inclusiveEnd = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
    onApply({ start: startDate, end: inclusiveEnd });
    onClose();
  };

  const canApply = !!startDate && !!endDate;

  const prevFromMonth = () => {
    if (fromMonth === 0) {
      setFromYear((y) => y - 1);
      setFromMonth(11);
    } else setFromMonth((m) => m - 1);
  };
  const nextFromMonth = () => {
    if (fromMonth === 11) {
      setFromYear((y) => y + 1);
      setFromMonth(0);
    } else setFromMonth((m) => m + 1);
  };
  const prevToMonth = () => {
    if (toMonth === 0) {
      setToYear((y) => y - 1);
      setToMonth(11);
    } else setToMonth((m) => m - 1);
  };
  const nextToMonth = () => {
    if (toMonth === 11) {
      setToYear((y) => y + 1);
      setToMonth(0);
    } else setToMonth((m) => m + 1);
  };

  const fromLabel = startDate
    ? new Date(startDate.getTime() + PP_OFFSET_MS).toLocaleDateString(
        isKhmer ? "km-KH" : "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        },
      )
    : t("common.selectStart");
  const toLabel = endDate
    ? new Date(endDate.getTime() + PP_OFFSET_MS).toLocaleDateString(
        isKhmer ? "km-KH" : "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        },
      )
    : t("common.selectEnd");

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
              // maxHeight: isTablet ? "89%" : "87%" ,
              maxHeight: !isMobile ? "80%" : "87%",
              height: !isMobile ? "80%" : "87%",
              maxWidth: !isMobile ? 450 : "100%",
              width: !isMobile ? 450 : "100%",
              borderBottomLeftRadius: !isMobile ? 20 : 0,
              borderBottomRightRadius: !isMobile ? 20 : 0,
            },
          ]}
        >
          {/* Header */}
          <View style={s.header}>
            <Text style={s.headerTitle}>{t("common.customDateRange")}</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <MaterialIcons
                name="close"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Presets */}
            <View style={s.presetRow}>
              {PRESET_OPTIONS.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => handlePreset(p.id)}
                  style={[
                    s.presetChip,
                    activePreset === p.id && s.presetChipActive,
                  ]}
                >
                  <Text
                    style={[
                      s.presetText,
                      activePreset === p.id && s.presetTextActive,
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.divider} />

            {/* Selected range display */}
            <View style={s.rangeDisplay}>
              <TouchableOpacity
                style={[s.rangeBox, selecting === "start" && s.rangeBoxActive]}
                onPress={() => setSelecting("start")}
              >
                <Text style={s.rangeBoxLabel}>{t("common.from")}</Text>
                <Text
                  style={[s.rangeBoxValue, !startDate && s.rangeBoxPlaceholder]}
                >
                  {fromLabel}
                </Text>
              </TouchableOpacity>
              <MaterialIcons
                name="arrow-forward"
                size={16}
                color={theme.colors.textSecondary}
              />
              <TouchableOpacity
                style={[s.rangeBox, selecting === "end" && s.rangeBoxActive]}
                onPress={() => setSelecting("end")}
              >
                <Text style={s.rangeBoxLabel}>{t("common.to")}</Text>
                <Text
                  style={[s.rangeBoxValue, !endDate && s.rangeBoxPlaceholder]}
                >
                  {toLabel}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={s.divider} />

            {/* From calendar */}
            <Text style={s.calSectionLabel}>
              {selecting === "start"
                ? t("common.pickStartDate")
                : t("common.from")}
            </Text>
            <MiniCalendar
              year={fromYear}
              month={fromMonth}
              selected={selecting === "start" ? startDate : null}
              rangeStart={startDate}
              rangeEnd={endDate}
              onSelect={handleDayPress}
              onPrevMonth={prevFromMonth}
              onNextMonth={nextFromMonth}
            />

            {/* <View style={[s.divider, { marginVertical: 12 }]} /> */}

            {/* To calendar */}
            {/* <Text style={s.calSectionLabel}>
              {selecting === "end" ? "Pick end date" : "To"}
            </Text>
            <MiniCalendar
              year={toYear}
              month={toMonth}
              selected={selecting === "end" ? endDate : null}
              rangeStart={startDate}
              rangeEnd={endDate}
              onSelect={handleDayPress}
              onPrevMonth={prevToMonth}
              onNextMonth={nextToMonth}
              showNav
            /> */}

            {/* <View style={{ height: 16 }} /> */}
          </ScrollView>

          {/* Footer */}
          <View style={[s.footer, { paddingBottom: insets.bottom }]}>
            <TouchableOpacity style={s.btnCancel} onPress={onClose}>
              <Text style={s.btnCancelText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btnApply, !canApply && s.btnApplyDisabled]}
              onPress={handleApply}
              disabled={!canApply}
            >
              <Text style={s.btnApplyText}>{t("common.apply")}</Text>
            </TouchableOpacity>
          </View>
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
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: "89%",
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: `${theme.colors.textSecondary}33`,
  },
  headerTitle: {
    fontSize: theme.fontSizes.lg,
    // fontWeight: "700",
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  closeBtn: { padding: 4 },
  divider: {
    height: 0.5,
    backgroundColor: `${theme.colors.textSecondary}33`,
    marginHorizontal: 0,
  },
  presetRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: `${theme.colors.secondary}55`,
    backgroundColor: theme.colors.background,
  },
  presetChipActive: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary,
  },
  presetText: {
    fontSize: theme.fontSizes.xs,
    // fontWeight: "600",
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  presetTextActive: { color: "#fff" },
  rangeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rangeBox: {
    flex: 1,
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.md,
    padding: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  rangeBoxActive: { borderColor: theme.colors.secondary },
  rangeBoxLabel: {
    fontSize: theme.fontSizes.xs,
    // fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: 2,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  rangeBoxValue: {
    fontSize: theme.fontSizes.sm,
    // fontWeight: "600",
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  rangeBoxPlaceholder: { color: theme.colors.textSecondary },
  calSectionLabel: {
    fontSize: theme.fontSizes.xs,
    // fontWeight: "600",
    color: theme.colors.textSecondary,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: `${theme.colors.textSecondary}33`,
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    alignItems: "center",
  },
  btnCancelText: {
    fontSize: theme.fontSizes.md,
    // fontWeight: "600",
    color: theme.colors.secondary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  btnApply: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.secondary,
    alignItems: "center",
  },
  btnApplyDisabled: { opacity: 0.4 },
  btnApplyText: {
    fontSize: theme.fontSizes.md,
    // fontWeight: "600",
    color: theme.colors.background2,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
