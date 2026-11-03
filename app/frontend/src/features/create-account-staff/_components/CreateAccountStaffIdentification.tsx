import { AppColors } from "@/constants/appcolors";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COMMON_POSITIONS } from "../_utils/createAccountStaffUtils";

interface CreateAccountStaffIdentificationProps {
  staffId: string;
  setStaffId: (v: string) => void;
  systemId: string;
  suggestedIdLoading: boolean;
  name: string;
  setName: (v: string) => void;
  position: string;
  setPosition: (v: string) => void;
}

export const CreateAccountStaffIdentification: React.FC<
  CreateAccountStaffIdentificationProps
> = ({
  staffId,
  setStaffId,
  systemId,
  suggestedIdLoading,
  name,
  setName,
  position,
  setPosition,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardSectionTitle}>Staff Identification</Text>

      {/* Staff ID & System ID */}
      <View style={styles.rowFields}>
        <View style={{ flex: 1.2, marginRight: 6 }}>
          <Text style={styles.label}>
            Staff ID <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={staffId}
              onChangeText={setStaffId}
              placeholder="e.g. ID-0010"
              placeholderTextColor={AppColors.grey}
              autoCapitalize="characters"
            />
          </View>
        </View>

        <View style={{ flex: 1.5, marginLeft: 6 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.label}>System ID (Auto)</Text>
            {suggestedIdLoading && (
              <ActivityIndicator
                size="small"
                color={AppColors.primary}
                style={{ marginBottom: 4 }}
              />
            )}
          </View>
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: `${AppColors.grey}20` },
            ]}
          >
            <TextInput
              style={[
                styles.textInput,
                {
                  color: AppColors.textPrimary,
                  fontSize: 13,
                  fontWeight: "600",
                },
              ]}
              value={systemId}
              editable={false}
              placeholder="e.g. system-0001-0004"
              placeholderTextColor={AppColors.grey}
            />
          </View>
        </View>
      </View>

      {/* Full Name */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Full Name <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="person-outline"
            size={20}
            color={AppColors.grey}
            style={styles.fieldIcon}
          />
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Enter full name"
            placeholderTextColor={AppColors.grey}
            autoCapitalize="words"
          />
        </View>
      </View>

      {/* Position */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Position <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.inputContainer}>
          <MaterialIcons
            name="badge"
            size={20}
            color={AppColors.grey}
            style={styles.fieldIcon}
          />
          <TextInput
            style={styles.textInput}
            value={position}
            onChangeText={setPosition}
            placeholder="e.g. Barista, Manager, Staff"
            placeholderTextColor={AppColors.grey}
            autoCapitalize="words"
          />
        </View>

        {/* Common positions quick chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
        >
          {COMMON_POSITIONS.map((pos) => (
            <TouchableOpacity
              key={pos}
              onPress={() => setPosition(pos)}
              style={[
                styles.quickChip,
                position.toLowerCase() === pos.toLowerCase() &&
                  styles.quickChipSelected,
              ]}
            >
              <Text
                style={[
                  styles.quickChipText,
                  position.toLowerCase() === pos.toLowerCase() &&
                    styles.quickChipTextSelected,
                ]}
              >
                {pos}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
  rowFields: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
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
  chipsScroll: {
    marginTop: 8,
    flexDirection: "row",
  },
  quickChip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: `${AppColors.grey}20`,
    marginRight: 6,
  },
  quickChipSelected: {
    backgroundColor: `${AppColors.primary}25`,
    borderWidth: 1,
    borderColor: AppColors.primary,
  },
  quickChipText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  quickChipTextSelected: {
    color: AppColors.primary,
    fontWeight: "700",
  },
});
