import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface InfoCompanyTelegramCardProps {
  telegramBotToken: string;
  setTelegramBotToken: (val: string) => void;
  showBotToken: boolean;
  setShowBotToken: (val: boolean) => void;
  telegramChatId: string;
  setTelegramChatId: (val: string) => void;
}

export const InfoCompanyTelegramCard: React.FC<
  InfoCompanyTelegramCardProps
> = ({
  telegramBotToken,
  setTelegramBotToken,
  showBotToken,
  setShowBotToken,
  telegramChatId,
  setTelegramChatId,
}) => {
  const { t } = useLanguage();

  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <FontAwesome5
            name="telegram-plane"
            size={22}
            color={theme.colors.primary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            {t(
              "infoCompany.telegramNotifications",
              "Telegram Alert Notifications",
            )}
          </Text>
          <Text style={styles.cardSubtitle}>
            {t(
              "infoCompany.telegramDesc",
              "Receive instant attendance and request alerts directly in your Telegram group",
            )}
          </Text>
        </View>
      </View>

      {/* Bot Token */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          {t("infoCompany.telegramBotToken", "Telegram Bot Token")}
        </Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="key-outline"
            size={20}
            color={theme.colors.grey}
            style={styles.fieldIcon}
          />
          <TextInput
            style={styles.textInput}
            value={telegramBotToken}
            onChangeText={setTelegramBotToken}
            multiline={false}
            numberOfLines={1}
            placeholder={t(
              "infoCompany.telegramBotTokenPlaceholder",
              "e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ",
            )}
            placeholderTextColor={theme.colors.grey}
            secureTextEntry={!showBotToken}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            onPress={() => setShowBotToken(!showBotToken)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showBotToken ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={theme.colors.grey}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat ID */}
      <View style={[styles.fieldGroup, { marginTop: 14 }]}>
        <Text style={styles.label}>
          {t("infoCompany.telegramChatId", "Telegram Chat ID")}
        </Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={20}
            color={theme.colors.grey}
            style={styles.fieldIcon}
          />
          <TextInput
            style={styles.textInput}
            value={telegramChatId}
            onChangeText={setTelegramChatId}
            multiline={false}
            numberOfLines={1}
            placeholder={t(
              "infoCompany.telegramChatIdPlaceholder",
              "e.g. -1001234567890 or @channel",
            )}
            placeholderTextColor={theme.colors.grey}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <Text style={styles.hintText}>
        🤖{" "}
        {t(
          "infoCompany.telegramHint",
          "Ensure your Telegram Bot is added as Administrator to the target group or channel.",
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
  fieldGroup: {},
  label: {
    fontSize: theme.fontSizes.sm,
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
    height: 48,
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
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.regular,
  },
  hintText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 10,
    fontFamily: theme.fonts.regular,
  },
});
