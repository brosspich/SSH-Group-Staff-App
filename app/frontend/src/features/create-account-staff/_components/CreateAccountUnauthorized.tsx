import AppbarBack from "@/components/appbar/appbarback";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const CreateAccountUnauthorized: React.FC = () => {
  return (
    <View style={styles.safe}>
      <AppbarBack
        Title="Create Account Staff"
        fallbackRoute="/(tabs)/setting"
      />
      <View style={styles.centerContainer}>
        <View style={styles.lockCircle}>
          <MaterialIcons name="lock-outline" size={54} color={AppColors.red} />
        </View>
        <Text style={styles.unauthTitle}>Access Denied</Text>
        <Text style={styles.unauthSubtitle}>
          Only Administrators and Owners are authorized to create new staff
          accounts.
        </Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace("/(tabs)/setting")}
          activeOpacity={0.8}
        >
          <Text style={styles.backBtnText}>Return to Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  lockCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${AppColors.red}18`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  unauthTitle: {
    fontSize: 20,
    fontFamily: AppFonts.bold,
    color: AppColors.textPrimary,
    marginBottom: 8,
    includeFontPadding: false,
  },
  unauthSubtitle: {
    fontSize: 14,
    fontFamily: AppFonts.regular,
    color: AppColors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    includeFontPadding: false,
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: AppColors.primary,
  },
  backBtnText: {
    color: "#fff",
    fontFamily: AppFonts.bold,
    fontSize: 14,
    includeFontPadding: false,
  },
});
