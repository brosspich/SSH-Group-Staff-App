import AppbarBack from "@/shared/components/appbar/appbarback";
import Loading from "@/shared/components/loading/loading";
import { theme } from "@/shared/styles/theme";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { isOwnerRole } from "@/utils/roleUtils";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CreateAccountStaffContact } from "./_components/CreateAccountStaffContact";
import { CreateAccountStaffCredentials } from "./_components/CreateAccountStaffCredentials";
import { CreateAccountStaffHeader } from "./_components/CreateAccountStaffHeader";
import { CreateAccountStaffIdentification } from "./_components/CreateAccountStaffIdentification";
import { CreateAccountStaffRoleStatus } from "./_components/CreateAccountStaffRoleStatus";
import { CreateAccountSuccessModal } from "./_components/CreateAccountSuccessModal";
import { CreateAccountUnauthorized } from "./_components/CreateAccountUnauthorized";
import { useCreateAccountStaff } from "./_hooks/useCreateAccountStaff";

export default function CreateAccountStaffScreen() {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsive();

  const {
    currentUser,
    checkingAuth,
    isAuthorized,
    name,
    setName,
    username,
    setUsername,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    staffId,
    setStaffId,
    systemKey,
    setSystemKey,
    systemId,
    position,
    setPosition,
    email,
    setEmail,
    phone,
    setPhone,
    selectedRoles,
    toggleRole,
    isActive,
    setIsActive,
    joinedDate,
    setJoinedDate,
    saving,
    errorMessage,
    successModalVisible,
    setSuccessModalVisible,
    suggestedIdLoading,
    availableSystems,
    handleSubmit,
    resetForm,
  } = useCreateAccountStaff();

  if (checkingAuth) {
    return <Loading />;
  }

  if (!isAuthorized) {
    return <CreateAccountUnauthorized />;
  }

  const isOwner = isOwnerRole(currentUser?.role);

  return (
    <View style={styles.safe}>
      <AppbarBack
        Title="Create Account Staff"
        fallbackRoute="/(tabs)/setting"
      />

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === "ios" ? 40 : 120}
        enableResetScrollToCoords={false}
      >
        <View
          style={[
            styles.containerWrapper,
            { maxWidth: isMobile ? "100%" : 650 },
          ]}
        >
          {/* Header Badge */}
          <CreateAccountStaffHeader
            isOwner={isOwner}
            systemKey={systemKey}
            availableSystems={availableSystems}
            onSelectSystem={setSystemKey}
          />

          {/* Error Banner */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={20} color={theme.colors.red} />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

          {/* Identification Section */}
          <CreateAccountStaffIdentification
            staffId={staffId}
            setStaffId={setStaffId}
            systemId={systemId}
            suggestedIdLoading={suggestedIdLoading}
            name={name}
            setName={setName}
            position={position}
            setPosition={setPosition}
          />

          {/* Credentials Section */}
          <CreateAccountStaffCredentials
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />

          {/* Role & Status Section */}
          <CreateAccountStaffRoleStatus
            selectedRoles={selectedRoles}
            toggleRole={toggleRole}
            isActive={isActive}
            setIsActive={setIsActive}
            joinedDate={joinedDate}
            setJoinedDate={setJoinedDate}
          />

          {/* Contact Section */}
          <CreateAccountStaffContact
            phone={phone}
            setPhone={setPhone}
            email={email}
            setEmail={setEmail}
          />

          {/* Submit Action Button */}
          <TouchableOpacity
            style={[styles.createBtn, saving && styles.createBtnDisabled]}
            onPress={handleSubmit}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <View style={styles.btnLoadingRow}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.createBtnText}>Creating Staff...</Text>
              </View>
            ) : (
              <View style={styles.btnLoadingRow}>
                <Ionicons
                  name="person-add-outline"
                  size={20}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.createBtnText}>Create Staff Account</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* Success Modal */}
      <CreateAccountSuccessModal
        visible={successModalVisible}
        onClose={() => {
          setSuccessModalVisible(false);
          resetForm();
        }}
        staffName={name}
        staffId={staffId}
        systemId={systemId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 16,
    alignItems: "center",
  },
  containerWrapper: {
    width: "100%",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${theme.colors.red}20`,
    borderWidth: 1,
    borderColor: theme.colors.red,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.red,
    fontWeight: "600",
  },
  createBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  createBtnDisabled: {
    opacity: 0.6,
  },
  btnLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  createBtnText: {
    fontSize: theme.fontSizes.md,
    fontWeight: "700",
    color: "#fff",
  },
});
