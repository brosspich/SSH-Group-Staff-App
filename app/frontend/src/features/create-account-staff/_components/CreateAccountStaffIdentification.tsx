import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COMMON_POSITIONS } from "../_utils/createAccountStaffUtils";

interface CreateAccountStaffIdentificationProps {
  staffId: string;
  setStaffId: (v: string) => void;
  systemId: string;
  suggestedIdLoading: boolean;
  name: string;
  setName: (v: string) => void;
  position: string;
  setPosition: (v: string) => void;
}

export const CreateAccountStaffIdentification: React.FC<
  CreateAccountStaffIdentificationProps
> = ({
  staffId,
  setStaffId,
  systemId,
  suggestedIdLoading,
  name,
  setName,
  position,
  setPosition,
}) => {
  const { t } = useLanguage();

  return (
    <View style={styles.card}>
      <Text style={styles.cardSectionTitle}>
        {t("createAccountStaff.staffIdentification", "Staff Identification")}
      </Text>

      {/* Staff ID & System ID */}
      <View style={styles.rowFields}>
        <View style={{ flex: 1.2, marginRight: 6 }}>
          <Text style={styles.label}>
            {t("createAccountStaff.staffId", "Staff ID")}{" "}
            <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={staffId}
              onChangeText={setStaffId}
              placeholder={t(
                "createAccountStaff.staffIdPlaceholder",
                "e.g. ID-0010",
              )}
              placeholderTextColor={theme.colors.grey}
              autoCapitalize="characters"
            />
          </View>
        </View>

        <View style={{ flex: 1.5, marginLeft: 6 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.label} numberOfLines={1} ellipsizeMode="middle">
              {t("createAccountStaff.systemIdAuto", "System ID (Auto)")}
            </Text>
            {suggestedIdLoading && (
              <ActivityIndicator
                size="small"
                color={theme.colors.primary}
                style={{ marginBottom: 4 }}
              />
            )}
          </View>
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: `${theme.colors.grey}20` },
            ]}
          >
            <TextInput
              style={[
                styles.textInput,
                {
                  color: theme.colors.textPrimary,
                  fontSize: theme.fontSizes.sm,
                  fontFamily: theme.fonts.semibold,
                  includeFontPadding: false,
                },
              ]}
              value={systemId}
              editable={false}
              placeholder="e.g. system-0001-0004"
              placeholderTextColor={theme.colors.grey}
            />
          </View>
        </View>
      </View>

      {/* Full Name */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          {t("createAccountStaff.fullName", "Full Name")}{" "}
          <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="person-outline"
            size={20}
            color={theme.colors.grey}
            style={styles.fieldIcon}
          />
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder={t(
              "createAccountStaff.namePlaceholder",
              "Enter full name",
            )}
            placeholderTextColor={theme.colors.grey}
            autoCapitalize="words"
          />
        </View>
      </View>

      {/* Position */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          {t("createAccountStaff.position", "Position")}{" "}
          <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.inputContainer}>
          <MaterialIcons
            name="badge"
            size={20}
            color={theme.colors.grey}
            style={styles.fieldIcon}
          />
          <TextInput
            style={styles.textInput}
            value={position}
            onChangeText={setPosition}
            placeholder={t(
              "createAccountStaff.positionPlaceholder",
              "e.g. Barista, Manager, Staff",
            )}
            placeholderTextColor={theme.colors.grey}
            autoCapitalize="words"
          />
        </View>

        {/* Common positions quick chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
        >
          {COMMON_POSITIONS.map((pos) => (
            <TouchableOpacity
              key={pos}
              onPress={() => setPosition(pos)}
              style={[
                styles.quickChip,
                position.toLowerCase() === pos.toLowerCase() &&
                  styles.quickChipSelected,
              ]}
            >
              <Text
                style={[
                  styles.quickChipText,
                  position.toLowerCase() === pos.toLowerCase() &&
                    styles.quickChipTextSelected,
                ]}
              >
                {pos}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
  },
  cardSectionTitle: {
    fontSize: theme.fontSizes.md,
    // fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 14,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  rowFields: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: theme.fontSizes.sm,
    // fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: 6,
    fontFamily: theme.fonts.semibold,
    includeFontPadding: false,
    flexShrink: 1, // Allow label to shrink if needed
  },
  requiredStar: {
    color: theme.colors.red,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${theme.colors.grey}15`,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: `${theme.colors.grey}30`,
    paddingHorizontal: 12,
    height: 46,
  },
  fieldIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
  },
  chipsScroll: {
    marginTop: 8,
    flexDirection: "row",
  },
  quickChip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${theme.colors.grey}20`,
    marginRight: 6,
  },
  quickChipSelected: {
    backgroundColor: `${theme.colors.primary}25`,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  quickChipText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    // fontWeight: "500",
    fontFamily: theme.fonts.medium,
    includeFontPadding: false,
  },
  quickChipTextSelected: {
    color: theme.colors.primary,
    // fontWeight: "700",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
