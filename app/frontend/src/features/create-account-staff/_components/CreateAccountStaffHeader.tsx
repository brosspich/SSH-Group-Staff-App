import { theme } from "@/shared/styles/theme";
import type { DynamicSystemItem } from "@/shared/constants/attendanceConfig";
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
        <Ionicons name="shield-checkmark" size={24} color={theme.colors.primary} />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.systemHeaderTitle}>
            {isOwner ? "Owner Administrator" : "Branch Admin"}
          </Text>
          <Text style={styles.systemHeaderSub}>
            Managing System:{" "}
            <Text style={{ fontWeight: "700", color: theme.colors.primary }}>
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
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}25`,
  },
  systemHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  systemHeaderTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  systemHeaderSub: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
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
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${theme.colors.grey}22`,
    borderWidth: 1,
    borderColor: "transparent",
  },
  sysChipSelected: {
    backgroundColor: `${theme.colors.primary}20`,
    borderColor: theme.colors.primary,
  },
  sysChipText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  sysChipTextSelected: {
    color: theme.colors.primary,
  },
});
