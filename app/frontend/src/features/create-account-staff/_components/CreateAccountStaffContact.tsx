import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface CreateAccountStaffContactProps {
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
}

export const CreateAccountStaffContact: React.FC<
  CreateAccountStaffContactProps
> = ({ phone, setPhone, email, setEmail }) => {
  const { t } = useLanguage();

  return (
    <View style={styles.card}>
      <Text style={styles.cardSectionTitle}>
        {t(
          "createAccountStaff.contactInfoOptional",
          "Contact Information (Optional)",
        )}
      </Text>

      {/* Phone */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          {t("createAccountStaff.phone", "Phone Number")}
        </Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="call-outline"
            size={20}
            color={theme.colors.grey}
            style={styles.fieldIcon}
          />
          <TextInput
            style={styles.textInput}
            value={phone}
            onChangeText={setPhone}
            placeholder={t(
              "createAccountStaff.phonePlaceholder",
              "e.g. +855 12 345 678",
            )}
            placeholderTextColor={theme.colors.grey}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Email */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          {t("createAccountStaff.email", "Email Address")}
        </Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={20}
            color={theme.colors.grey}
            style={styles.fieldIcon}
          />
          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            placeholder={t(
              "createAccountStaff.emailPlaceholder",
              "staff@company.com",
            )}
            placeholderTextColor={theme.colors.grey}
            keyboardType="email-address"
            autoCapitalize="none"
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
  },
  cardSectionTitle: {
    fontSize: theme.fontSizes.md,
    // fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 14,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
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
});
