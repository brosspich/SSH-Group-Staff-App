import AppbarBack from "@/components/appbar/appbarback";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const ChangeInfoUnauthorized: React.FC = () => {
  return (
    <View style={styles.safe}>
      <AppbarBack
        Title="Change Info Account Staff"
        fallbackRoute="/(tabs)/setting"
      />
      <View style={styles.centerContainer}>
        <Ionicons name="lock-closed-outline" size={64} color={AppColors.grey} />
        <Text style={styles.deniedTitle}>Access Restricted</Text>
        <Text style={styles.deniedSub}>
          Only users with Admin or Owner privileges can access this feature.
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
  deniedTitle: {
    fontSize: 20,
    fontFamily: AppFonts.bold,
    color: AppColors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
    includeFontPadding: false,
  },
  deniedSub: {
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
