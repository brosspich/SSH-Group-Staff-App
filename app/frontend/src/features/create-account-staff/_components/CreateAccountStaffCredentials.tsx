import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CreateAccountStaffCredentialsProps {
  username: string;
  setUsername: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
}

export const CreateAccountStaffCredentials: React.FC<
  CreateAccountStaffCredentialsProps
> = ({
  username,
  setUsername,
  password,
  setPassword,
  showPassword,
  setShowPassword,
}) => {
  const { t } = useLanguage();

  return (
    <View style={styles.card}>
      <Text style={styles.cardSectionTitle}>
        {t("createAccountStaff.accountCredentials", "Account Credentials")}
      </Text>

      {/* Username */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          {t("createAccountStaff.username", "Username")}{" "}
          <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="at"
            size={20}
            color={theme.colors.grey}
            style={styles.fieldIcon}
          />
          <TextInput
            style={styles.textInput}
            value={username}
            onChangeText={(val) =>
              setUsername(val.toLowerCase().replace(/\s/g, ""))
            }
            placeholder={t(
              "createAccountStaff.usernamePlaceholder",
              "lowercase username, no spaces",
            )}
            placeholderTextColor={theme.colors.grey}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Password */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          {t("createAccountStaff.password", "Password")}{" "}
          <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={theme.colors.grey}
            style={styles.fieldIcon}
          />
          <TextInput
            style={styles.textInput}
            value={password}
            onChangeText={setPassword}
            placeholder={t(
              "createAccountStaff.passwordPlaceholder",
              "Minimum 6 characters",
            )}
            placeholderTextColor={theme.colors.grey}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeBtn}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={theme.colors.grey}
            />
          </TouchableOpacity>
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
  eyeBtn: {
    padding: 6,
  },
});
