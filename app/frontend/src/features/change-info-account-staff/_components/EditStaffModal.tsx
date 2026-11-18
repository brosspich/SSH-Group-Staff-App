import { useResponsive } from "@/shared/hooks/useResponsive";
import { isOwnerRole } from "@/utils/roleUtils";
import { useEffect, useState } from "react";
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEditStaffForm } from "../_hooks/useEditStaffForm";
import type { EditStaffModalProps } from "../_types/editStaff.types";
import {
  EditStaffActions,
  EditStaffBasicFields,
  EditStaffContactFields,
  EditStaffErrorBanner,
  EditStaffHeader,
  EditStaffPasswordSection,
  EditStaffRolesSelector,
  editStaffStyles as styles,
} from "./edit-staff";

export default function EditStaffModal({
  visible,
  staff,
  currentUser,
  onClose,
  onSaved,
}: EditStaffModalProps) {
  const { isMobile } = useResponsive();
  const isOwner = isOwnerRole(currentUser?.role);
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Keyboard adaptive height handling
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Encapsulated Business & Form Logic Hook (SOLID / SRP)
  const {
    formData,
    updateField,
    toggleRole,
    wantResetPassword,
    setWantResetPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showNewPassword,
    setShowNewPassword,
    savingEdit,
    editError,
    handleSave,
  } = useEditStaffForm({
    visible,
    staff,
    onSaved,
    onClose,
  });

  const isKeyboardOpen = keyboardHeight > 0;
  const maxAvailableHeight = windowHeight - keyboardHeight - insets.top - 16;
  const normalHeight = windowHeight * (isMobile ? 0.85 : 0.8);
  const containerHeight = isKeyboardOpen
    ? Math.min(normalHeight, maxAvailableHeight)
    : normalHeight;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop press to dismiss keyboard or close modal */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => {
            if (isKeyboardOpen) {
              Keyboard.dismiss();
            } else {
              onClose();
            }
          }}
        />

        <View
          style={[
            styles.modalContainer,
            {
              maxWidth: isMobile ? "100%" : 600,
              height: containerHeight,
              maxHeight: maxAvailableHeight,
              marginBottom: keyboardHeight,
            },
          ]}
        >
          {/* 1. Modal Header */}
          <EditStaffHeader staff={staff} onClose={onClose} />

          {/* 2. Error Banner */}
          <EditStaffErrorBanner error={editError} />

          {/* 3. Keyboard-aware Scrollable Form */}
          <KeyboardAwareScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingVertical: 10,
              paddingHorizontal: 15,
              paddingBottom: 24,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            extraScrollHeight={Platform.OS === "ios" ? 40 : 80}
            enableResetScrollToCoords={false}
          >
            {/* Basic Information: Full Name, Username, Position, System ID */}
            <EditStaffBasicFields
              formData={formData}
              updateField={updateField}
              isOwner={isOwner}
            />

            {/* Roles Selection & Active Account Switch */}
            <EditStaffRolesSelector
              roles={formData.roles}
              toggleRole={toggleRole}
              isActive={formData.isActive}
              setIsActive={(val) => updateField("isActive", val)}
            />

            {/* Contact Information & Joined / DOB Dates */}
            <EditStaffContactFields
              formData={formData}
              updateField={updateField}
            />

            {/* Password Reset Accordion */}
            <EditStaffPasswordSection
              wantResetPassword={wantResetPassword}
              setWantResetPassword={setWantResetPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              showNewPassword={showNewPassword}
              setShowNewPassword={setShowNewPassword}
            />
          </KeyboardAwareScrollView>

          {/* 4. Action Buttons (Cancel / Save Changes) */}
          <EditStaffActions
            saving={savingEdit}
            onCancel={onClose}
            onSave={handleSave}
          />
        </View>
      </View>
    </Modal>
  );
}
