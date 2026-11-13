import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface InfoCompanyQrCardProps {
  qrCodes: string[];
  newQrInput: string;
  setNewQrInput: (val: string) => void;
  onAddQrCode: () => void;
  onRemoveQrCode: (qr: string) => void;
}

export const InfoCompanyQrCard: React.FC<InfoCompanyQrCardProps> = ({
  qrCodes,
  newQrInput,
  setNewQrInput,
  onAddQrCode,
  onRemoveQrCode,
}) => {
  const { t } = useLanguage();

  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            name="qrcode-scan"
            size={22}
            color={theme.colors.primary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            {t("infoCompany.qrCodes", "Attendance QR Codes")}
          </Text>
          <Text style={styles.cardSubtitle}>
            {t(
              "infoCompany.qrCodesDesc",
              "Official QR codes staff can scan for attendance",
            )}
          </Text>
        </View>
      </View>

      {/* QR Codes List */}
      <View style={styles.qrListContainer}>
        {qrCodes.length === 0 ? (
          <Text style={styles.emptyText}>
            {t("common.none", "No QR codes configured yet")}
          </Text>
        ) : (
          qrCodes.map((qr, index) => (
            <View key={`${qr}-${index}`} style={styles.qrItem}>
              <View style={styles.qrItemLeft}>
                <Ionicons
                  name="qr-code-outline"
                  size={18}
                  color={theme.colors.primary}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.qrText} numberOfLines={1}>
                  {qr}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => onRemoveQrCode(qr)}
                style={styles.deleteBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={theme.colors.red}
                />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Add New QR Code Form */}
      <View style={styles.addForm}>
        <View style={styles.inputContainer}>
          <Ionicons
            name="add-circle-outline"
            size={20}
            color={theme.colors.grey}
            style={styles.fieldIcon}
          />
          <TextInput
            style={styles.textInput}
            value={newQrInput}
            onChangeText={setNewQrInput}
            multiline={false}
            numberOfLines={1}
            placeholder={t(
              "infoCompany.qrPlaceholder",
              "Enter QR code string (e.g. COMPANY_QR_2026)",
            )}
            placeholderTextColor={theme.colors.grey}
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity
          style={[styles.addBtn, !newQrInput.trim() && styles.addBtnDisabled]}
          onPress={onAddQrCode}
          disabled={!newQrInput.trim()}
          activeOpacity={0.8}
        >
          <Ionicons
            name="add"
            size={18}
            color={theme.colors.background2}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.addBtnText}>
            {t("infoCompany.addQrCode", "Add")}
          </Text>
        </TouchableOpacity>
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
  qrListContainer: {
    gap: 8,
    marginBottom: 14,
  },
  emptyText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    fontStyle: "italic",
    paddingVertical: 6,
  },
  qrItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: `${theme.colors.grey}15`,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: `${theme.colors.grey}30`,
  },
  qrItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  qrText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.medium,
    flex: 1,
  },
  deleteBtn: {
    padding: 4,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${theme.colors.red}15`,
  },
  addForm: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${theme.colors.grey}15`,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: `${theme.colors.grey}30`,
    paddingHorizontal: 12,
    height: 46,
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
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.regular,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 14,
    height: 46,
  },
  addBtnDisabled: {
    backgroundColor: theme.colors.grey,
    opacity: 0.6,
  },
  addBtnText: {
    color: theme.colors.background2,
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
