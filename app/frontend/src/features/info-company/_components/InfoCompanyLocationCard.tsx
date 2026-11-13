import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface InfoCompanyLocationCardProps {
  locations: string[];
  newLocationInput: string;
  setNewLocationInput: (val: string) => void;
  onAddLocation: () => void;
  onRemoveLocation: (index: number) => void;
}

export const InfoCompanyLocationCard: React.FC<
  InfoCompanyLocationCardProps
> = ({
  locations,
  newLocationInput,
  setNewLocationInput,
  onAddLocation,
  onRemoveLocation,
}) => {
  const { t } = useLanguage();

  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <MaterialIcons
            name="location-on"
            size={22}
            color={theme.colors.primary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            {t("infoCompany.location", "Location & GPS Geofence")}
          </Text>
          <Text style={styles.cardSubtitle}>
            {t(
              "infoCompany.locationDesc",
              "Coordinates (e.g. 11.502767, 104.851539) or Google Maps link",
            )}
          </Text>
        </View>
      </View>

      {/* Locations List */}
      <View style={styles.locationListContainer}>
        {locations.length === 0 ? (
          <Text style={styles.emptyText}>
            {t(
              "infoCompany.noLocations",
              "No location coordinates configured yet",
            )}
          </Text>
        ) : (
          locations.map((loc, index) => (
            <View key={`${loc}-${index}`} style={styles.locationItem}>
              {/* Index Number Badge: 1, 2, 3, 4... */}
              <View style={styles.indexBadge}>
                <Text style={styles.indexBadgeText}>{index + 1}</Text>
              </View>

              <View style={styles.locationItemLeft}>
                <Ionicons
                  name="navigate-outline"
                  size={16}
                  color={theme.colors.primary}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.locationText} numberOfLines={1}>
                  {loc}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => onRemoveLocation(index)}
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

      {/* Add New Location Form */}
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
            value={newLocationInput}
            onChangeText={setNewLocationInput}
            multiline={false}
            numberOfLines={1}
            placeholder={t(
              "infoCompany.locationPlaceholder",
              "e.g. 11.502767, 104.851539 or https://maps.app.goo.gl/...",
            )}
            placeholderTextColor={theme.colors.grey}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.addBtn,
            !newLocationInput.trim() && styles.addBtnDisabled,
          ]}
          onPress={onAddLocation}
          disabled={!newLocationInput.trim()}
          activeOpacity={0.8}
        >
          <Ionicons
            name="add"
            size={18}
            color={theme.colors.background2}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.addBtnText}>
            {t("infoCompany.addLocation", "Add")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hint Note */}
      <Text style={styles.hintText}>
        💡{" "}
        {t(
          "infoCompany.locationHint",
          "Staff GPS is verified against any of these registered locations during attendance check-in.",
        )}
      </Text>
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
  locationListContainer: {
    gap: 8,
    marginBottom: 14,
  },
  emptyText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    fontStyle: "italic",
    paddingVertical: 6,
    textAlign: "center",
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: `${theme.colors.grey}10`,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: `${theme.colors.grey}25`,
  },
  indexBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: `${theme.colors.primary}20`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  indexBadgeText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  locationItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  locationText: {
    fontSize: theme.fontSizes.xs,
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
  hintText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 10,
    fontFamily: theme.fonts.regular,
  },
});
