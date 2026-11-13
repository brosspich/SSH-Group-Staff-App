import { useLanguage } from "@/features/language";
import AppbarBack from "@/shared/components/appbar/appbarback";
import Loading from "@/shared/components/loading/loading";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { InfoCompanyGeneralCard } from "./_components/InfoCompanyGeneralCard";
import { InfoCompanyLocationCard } from "./_components/InfoCompanyLocationCard";
import { InfoCompanyQrCard } from "./_components/InfoCompanyQrCard";
import { InfoCompanyTelegramCard } from "./_components/InfoCompanyTelegramCard";
import { InfoCompanyTimeCard } from "./_components/InfoCompanyTimeCard";
import { InfoCompanyUnauthorized } from "./_components/InfoCompanyUnauthorized";
import { useInfoCompany } from "./_hooks/useInfoCompany";

export default function InfoCompanyScreen() {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsive();
  const { t } = useLanguage();

  const {
    checkingAuth,
    isAuthorized,
    isOwner,
    availableCompanies,
    selectedCompanyId,
    setSelectedCompanyId,
    name,
    setName,
    qrCodes,
    newQrInput,
    setNewQrInput,
    handleAddQrCode,
    handleRemoveQrCode,
    locations,
    newLocationInput,
    setNewLocationInput,
    handleAddLocation,
    handleRemoveLocation,
    telegramBotToken,
    setTelegramBotToken,
    showBotToken,
    setShowBotToken,
    telegramChatId,
    setTelegramChatId,
    timeIn,
    setTimeIn,
    timeOut,
    setTimeOut,
    loading,
    saving,
    errorMessage,
    successMessage,
    loadCompany,
    handleSave,
  } = useInfoCompany();

  // 1. Loading screen while auth is verifying
  if (checkingAuth) {
    return (
      <View style={styles.safe}>
        <AppbarBack
          Title={t("infoCompany.title", "Company Information")}
          fallbackRoute="/(tabs)/setting"
        />
        <Loading />
      </View>
    );
  }

  // 2. Access control guard (Only role admin or owner)
  if (!isAuthorized) {
    return <InfoCompanyUnauthorized />;
  }

  return (
    <View style={styles.safe}>
      <AppbarBack
        Title={t("infoCompany.title", "Company Information")}
        fallbackRoute="/(tabs)/setting"
      />

      <KeyboardAwareScrollView
        style={styles.keyboardView}
        contentContainerStyle={[
          styles.scrollContent,
          !isMobile && styles.webContent,
          { paddingBottom: insets.bottom + 36 },
        ]}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === "ios" ? 50 : 20}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => loadCompany(selectedCompanyId)}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Banner Messages */}
        {errorMessage && (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle"
              size={18}
              color={theme.colors.red}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {successMessage && (
          <View style={styles.successBox}>
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={theme.colors.green}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        {/* 1. General Profile & System Selection */}
        <InfoCompanyGeneralCard
          selectedCompanyId={selectedCompanyId}
          setSelectedCompanyId={setSelectedCompanyId}
          isOwner={isOwner}
          availableCompanies={availableCompanies}
          name={name}
          setName={setName}
        />

        {/* 2. QR Codes for Attendance */}
        <InfoCompanyQrCard
          qrCodes={qrCodes}
          newQrInput={newQrInput}
          setNewQrInput={setNewQrInput}
          onAddQrCode={handleAddQrCode}
          onRemoveQrCode={handleRemoveQrCode}
        />

        {/* 3. Location & GPS Geofence */}
        <InfoCompanyLocationCard
          locations={locations}
          newLocationInput={newLocationInput}
          setNewLocationInput={setNewLocationInput}
          onAddLocation={handleAddLocation}
          onRemoveLocation={handleRemoveLocation}
        />

        {/* 4. Telegram Bot Token & Chat ID */}
        <InfoCompanyTelegramCard
          telegramBotToken={telegramBotToken}
          setTelegramBotToken={setTelegramBotToken}
          showBotToken={showBotToken}
          setShowBotToken={setShowBotToken}
          telegramChatId={telegramChatId}
          setTelegramChatId={setTelegramChatId}
        />

        {/* 5. Working Hours (Time-In & Time-Out) */}
        <InfoCompanyTimeCard
          timeIn={timeIn}
          setTimeIn={setTimeIn}
          timeOut={timeOut}
          setTimeOut={setTimeOut}
        />

        {/* Save Button (Styled after pic1) */}
        <TouchableOpacity
          style={[styles.successBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color={theme.colors.background2} />
          ) : (
            <>
              <Ionicons
                name="send-outline"
                size={16}
                color={theme.colors.background2}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.successCloseText}>
                {t("infoCompany.saveChanges", "Save Company Info")}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  webContent: {
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${theme.colors.red}18`,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: `${theme.colors.red}40`,
  },
  errorText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.red,
    flex: 1,
    fontFamily: theme.fonts.medium,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${theme.colors.green}18`,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: `${theme.colors.green}40`,
  },
  successText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.green,
    flex: 1,
    fontFamily: theme.fonts.medium,
  },
  successBtn: {
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  successCloseText: {
    color: theme.colors.background2,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  saveBtnDisabled: {
    opacity: 0.65,
  },
});
