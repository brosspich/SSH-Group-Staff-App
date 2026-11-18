import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { editStaffStyles as styles } from "./EditStaffStyles";

interface EditStaffErrorBannerProps {
  error: string | null;
}

export const EditStaffErrorBanner: React.FC<EditStaffErrorBannerProps> = ({
  error,
}) => {
  if (!error) return null;

  return (
    <View style={styles.errorBanner}>
      <Ionicons name="alert-circle" size={18} color={theme.colors.red} />
      <Text style={styles.errorBannerText}>{error}</Text>
    </View>
  );
};
