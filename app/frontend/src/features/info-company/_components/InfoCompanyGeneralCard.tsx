import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { CompanyInfo } from "../_types/infoCompany.types";

interface InfoCompanyGeneralCardProps {
  selectedCompanyId: string;
  setSelectedCompanyId: (id: string) => void;
  isOwner: boolean;
  availableCompanies: CompanyInfo[];
  name: string;
  setName: (name: string) => void;
}

export const InfoCompanyGeneralCard: React.FC<InfoCompanyGeneralCardProps> = ({
  selectedCompanyId,
  setSelectedCompanyId,
  isOwner,
  availableCompanies,
  name,
  setName,
}) => {
  const { t } = useLanguage();

  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            name="office-building"
            size={22}
            color={theme.colors.primary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            {t("infoCompany.companyProfile", "Company Profile")}
          </Text>
          <Text style={styles.cardSubtitle}>
            {t("infoCompany.managingCompany", "Managing Company:")}{" "}
            <Text style={styles.systemHighlight}>{selectedCompanyId}</Text>
          </Text>
        </View>
      </View>

      {/* Owner System Switcher */}
      {isOwner && availableCompanies.length > 1 && (
        <View style={styles.branchSwitcher}>
          <Text style={styles.label}>
            {t("changeInfoStaff.allSystems", "Switch Branch / System")}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.branchScroll}
          >
            {availableCompanies.map((c) => {
              const isSelected = c.id === selectedCompanyId;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.branchChip,
                    isSelected && styles.branchChipActive,
                  ]}
                  onPress={() => setSelectedCompanyId(c.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.branchChipText,
                      isSelected && styles.branchChipTextActive,
                    ]}
                  >
                    {c.name || c.id}
                  </Text>
                  <Text
                    style={[
                      styles.branchChipSub,
                      isSelected && styles.branchChipSubActive,
                    ]}
                  >
                    ({c.id})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Company Name Input */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          {t("infoCompany.companyName", "Company Name")} *
        </Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="business-outline"
            size={20}
            color={theme.colors.grey}
            style={styles.fieldIcon}
          />
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            multiline={false}
            numberOfLines={1}
            placeholder={t(
              "infoCompany.companyNamePlaceholder",
              "Enter company name",
            )}
            placeholderTextColor={theme.colors.grey}
          />
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
  systemHighlight: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  branchSwitcher: {
    marginBottom: 14,
    paddingTop: 4,
  },
  branchScroll: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  branchChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${theme.colors.grey}15`,
    borderWidth: 1,
    borderColor: `${theme.colors.grey}30`,
  },
  branchChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  branchChipText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  branchChipTextActive: {
    color: theme.colors.background2,
  },
  branchChipSub: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  branchChipSubActive: {
    color: `${theme.colors.background2}CC`,
  },
  fieldGroup: {
    marginTop: 6,
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
    paddingHorizontal: 12,
    height: 48,
    overflow: "hidden",
  },
  fieldIcon: {
    marginRight: 8,
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
    fontFamily: theme.fonts.regular,
  },
});
