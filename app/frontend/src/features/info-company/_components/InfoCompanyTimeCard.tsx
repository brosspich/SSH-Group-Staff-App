import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface InfoCompanyTimeCardProps {
  timeIn: string;
  setTimeIn: (val: string) => void;
  timeOut: string;
  setTimeOut: (val: string) => void;
}

const TIME_IN_PRESETS = ["07:30:00", "08:00:00", "08:30:00"];
const TIME_OUT_PRESETS = ["17:00:00", "17:30:00", "18:00:00"];

export const InfoCompanyTimeCard: React.FC<InfoCompanyTimeCardProps> = ({
  timeIn,
  setTimeIn,
  timeOut,
  setTimeOut,
}) => {
  const { t } = useLanguage();

  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Feather name="clock" size={22} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            {t("infoCompany.workHours", "Working Hours (Time-In & Time-Out)")}
          </Text>
          <Text style={styles.cardSubtitle}>
            {t(
              "infoCompany.workHoursDesc",
              "Standard daily time boundaries for staff attendance",
            )}
          </Text>
        </View>
      </View>

      <View style={styles.timeGrid}>
        {/* Time In */}
        <View style={styles.timeColumn}>
          <Text style={styles.label}>{t("infoCompany.timeIn", "Time In")}</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="log-in-outline"
              size={18}
              color={theme.colors.primary}
              style={styles.fieldIcon}
            />
            <TextInput
              style={styles.textInput}
              value={timeIn}
              onChangeText={setTimeIn}
              multiline={false}
              numberOfLines={1}
              placeholder="08:00:00"
              placeholderTextColor={theme.colors.grey}
            />
          </View>
          <View style={styles.presetRow}>
            {TIME_IN_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.presetChip,
                  timeIn === preset && styles.presetChipActive,
                ]}
                onPress={() => setTimeIn(preset)}
              >
                <Text
                  style={[
                    styles.presetText,
                    timeIn === preset && styles.presetTextActive,
                  ]}
                >
                  {preset.slice(0, 5)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Time Out */}
        <View style={styles.timeColumn}>
          <Text style={styles.label}>
            {t("infoCompany.timeOut", "Time Out")}
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="log-out-outline"
              size={18}
              color={theme.colors.red}
              style={styles.fieldIcon}
            />
            <TextInput
              style={styles.textInput}
              value={timeOut}
              onChangeText={setTimeOut}
              multiline={false}
              numberOfLines={1}
              placeholder="17:00:00"
              placeholderTextColor={theme.colors.grey}
            />
          </View>
          <View style={styles.presetRow}>
            {TIME_OUT_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.presetChip,
                  timeOut === preset && styles.presetChipActive,
                ]}
                onPress={() => setTimeOut(preset)}
              >
                <Text
                  style={[
                    styles.presetText,
                    timeOut === preset && styles.presetTextActive,
                  ]}
                >
                  {preset.slice(0, 5)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${theme.colors.grey}25`,
    ...theme.shadows.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  cardSubtitle: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  timeGrid: {
    flexDirection: "row",
    gap: 12,
  },
  timeColumn: {
    flex: 1,
  },
  label: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    marginBottom: 6,
    fontFamily: theme.fonts.semibold,
    includeFontPadding: false,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${theme.colors.grey}15`,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: `${theme.colors.grey}30`,
    paddingHorizontal: 10,
    height: 46,
    overflow: "hidden",
  },
  fieldIcon: {
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: "center",
    includeFontPadding: false,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.medium,
  },
  presetRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
    flexWrap: "wrap",
  },
  presetChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${theme.colors.grey}15`,
    borderWidth: 1,
    borderColor: `${theme.colors.grey}25`,
  },
  presetChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  presetText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.semibold,
  },
  presetTextActive: {
    color: theme.colors.background2,
  },
});
