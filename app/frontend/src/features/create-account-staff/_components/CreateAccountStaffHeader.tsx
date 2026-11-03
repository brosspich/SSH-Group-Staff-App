import { AppColors } from "@/constants/appcolors";
import type { DynamicSystemItem } from "@/constants/attendanceConfig";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

interface CreateAccountStaffHeaderProps {
  isOwner: boolean;
  systemKey: string;
  availableSystems: DynamicSystemItem[];
  onSelectSystem: (systemId: string) => void;
}

export const CreateAccountStaffHeader: React.FC<
  CreateAccountStaffHeaderProps
> = ({ isOwner, systemKey, availableSystems, onSelectSystem }) => {
  return (
    <View style={styles.systemHeaderCard}>
      <View style={styles.systemHeaderLeft}>
        <Ionicons name="shield-checkmark" size={24} color={AppColors.primary} />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.systemHeaderTitle}>
            {isOwner ? "Owner Administrator" : "Branch Admin"}
          </Text>
          <Text style={styles.systemHeaderSub}>
            Managing System:{" "}
            <Text style={{ fontWeight: "700", color: AppColors.primary }}>
              {systemKey.toUpperCase()}
            </Text>
          </Text>
        </View>
      </View>

      {/* Owner can toggle systems dynamically */}
      {isOwner && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 10 }}
          contentContainerStyle={styles.systemPickerRow}
        >
          {availableSystems.map((sysItem) => {
            const sys = sysItem.id;
            const isSelected = systemKey.toLowerCase() === sys.toLowerCase();
            return (
              <Pressable
                key={sys}
                onPress={() => onSelectSystem(sys)}
                style={[styles.sysChip, isSelected && styles.sysChipSelected]}
              >
                <Text
                  style={[
                    styles.sysChipText,
                    isSelected && styles.sysChipTextSelected,
                  ]}
                >
                  {sys.toUpperCase()}
                  {sysItem.companyName ? ` • ${sysItem.companyName}` : ""}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  systemHeaderCard: {
    backgroundColor: AppColors.background2,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${AppColors.primary}25`,
  },
  systemHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  systemHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.textPrimary,
  },
  systemHeaderSub: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  systemPickerRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  sysChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: `${AppColors.grey}22`,
    borderWidth: 1,
    borderColor: "transparent",
  },
  sysChipSelected: {
    backgroundColor: `${AppColors.primary}20`,
    borderColor: AppColors.primary,
  },
  sysChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.textSecondary,
  },
  sysChipTextSelected: {
    color: AppColors.primary,
  },
});
