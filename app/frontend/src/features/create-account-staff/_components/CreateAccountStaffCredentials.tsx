import { AppColors } from "@/constants/appcolors";
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
  return (
    <View style={styles.card}>
      <Text style={styles.cardSectionTitle}>Account Credentials</Text>

      {/* Username */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Username <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="at"
            size={20}
            color={AppColors.grey}
            style={styles.fieldIcon}
          />
          <TextInput
            style={styles.textInput}
            value={username}
            onChangeText={(val) =>
              setUsername(val.toLowerCase().replace(/\s/g, ""))
            }
            placeholder="lowercase username, no spaces"
            placeholderTextColor={AppColors.grey}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Password */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Password <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={AppColors.grey}
            style={styles.fieldIcon}
          />
          <TextInput
            style={styles.textInput}
            value={password}
            onChangeText={setPassword}
            placeholder="Minimum 6 characters"
            placeholderTextColor={AppColors.grey}
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
              color={AppColors.grey}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.background2,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${AppColors.grey}25`,
  },
  cardSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 14,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textPrimary,
    marginBottom: 6,
  },
  requiredStar: {
    color: AppColors.red,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${AppColors.grey}15`,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${AppColors.grey}30`,
    paddingHorizontal: 12,
    height: 46,
  },
  fieldIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: AppColors.textPrimary,
  },
  eyeBtn: {
    padding: 6,
  },
});
