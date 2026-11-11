import { ImageSourceModal } from "@/features/home/_components/ImageSourceModal";
import { ModalFooterButtons } from "@/features/home/_components/ModalFooterButtons";
import { ProofImageUpload } from "@/features/home/_components/ProofImageUpload";
import { RequestConfirmModal } from "@/features/home/_components/RequestConfirmModal";
import { useRequestAttendanceForm } from "@/features/home/_hooks/useRequestAttendanceForm";
import { formatDateDisplay } from "@/features/home/_utils/homeUtils";
import { useLanguage } from "@/features/language";
import { renderAlertModal } from "@/shared/components/alert/alert";
import DatePickerModal from "@/shared/components/daterangpicker/DatePickerModal";
import TimePickerModal from "@/shared/components/daterangpicker/TimePickerModal";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { StaffUser } from "@/shared/services/userService";
import { theme } from "@/shared/styles/theme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles as s } from "./RequestAttendanceModal.styles";

const QUICK_SUBJECTS = [
  "Forgot Check-In",
  "Forgot Check-Out",
  "Late Check-In",
  "Work Outside",
  "Leave Request",
];

export interface RequestAttendanceModalProps {
  visible: boolean;
  onClose: () => void;
  user?: StaffUser | null;
  onSubmit?: (data: {
    subject: string;
    remark: string;
    date: string;
    time: string;
    fromDate?: string;
    fromTime?: string;
    toDate?: string;
    toTime?: string;
    image?: string;
  }) => Promise<void> | void;
}

/**
 * Clean Request Attendance Modal following SOLID, DRY & Feature-based structure.
 */
export function RequestAttendanceModal({
  visible,
  onClose,
  user,
  onSubmit,
}: RequestAttendanceModalProps) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsive();
  const { height: windowHeight } = useWindowDimensions();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // Form State, Proof Image & Validation Hook (SRP)
  const {
    currentUser,
    fromDate,
    setFromDate,
    fromTime,
    setFromTime,
    toDate,
    setToDate,
    toTime,
    setToTime,
    datePickerTarget,
    setDatePickerTarget,
    timePickerTarget,
    setTimePickerTarget,
    subject,
    setSubject,
    remark,
    setRemark,
    imageUri,
    imageError,
    imageSourceModalVisible,
    setImageSourceModalVisible,
    submitting,
    errorMessage,
    setErrorMessage,
    confirmModalVisible,
    setConfirmModalVisible,
    alertModalVisible,
    alertTitle,
    alertBody,
    alertOnPress,
    handlePickImage,
    handleRemoveImage,
    handleClose,
    handleAlertDismiss,
    handleOpenConfirm,
    handleConfirmSubmit,
  } = useRequestAttendanceForm({
    visible,
    user,
    onClose,
    onSubmit,
  });

  // Track keyboard height to adjust modal sheet
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      },
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      },
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const maxSheetHeight =
    keyboardHeight > 0
      ? windowHeight - keyboardHeight - insets.top - 20
      : windowHeight * 0.88;

  return (
    <>
      <Modal
        visible={visible}
        statusBarTranslucent
        animationType={isMobile ? "slide" : "fade"}
        transparent
        onRequestClose={handleClose}
      >
        <View
          style={[
            s.backdrop,
            {
              justifyContent: !isMobile ? "center" : "flex-end",
              alignItems: !isMobile ? "center" : "stretch",
              padding: !isMobile ? 16 : 0,
            },
          ]}
        >
          <Pressable style={s.backdrop} onPress={handleClose} />
          <View
            style={[
              s.sheet,
              {
                maxWidth: !isMobile ? 480 : "100%",
                width: !isMobile ? 480 : "100%",
                borderRadius: !isMobile ? 20 : 0,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                maxHeight: maxSheetHeight,
                marginBottom: keyboardHeight,
                paddingBottom:
                  keyboardHeight > 0
                    ? 12
                    : isMobile
                      ? Math.max(insets.bottom, 16)
                      : 20,
              },
            ]}
          >
            {/* Header */}
            <View style={s.header}>
              <View style={s.headerLeft}>
                <View style={s.headerIconBadge}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={s.headerTitle}>
                  {t("home.requestModalTitle", "Request Attendance")}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                style={s.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons
                  name="close"
                  size={22}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content Body */}
            <ScrollView
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={s.scrollArea}
              contentContainerStyle={s.scrollContent}
            >
              {/* Display Staff Info */}
              <View style={s.staffCard}>
                <View style={s.avatarCircle}>
                  <Ionicons
                    name="person"
                    size={20}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={s.staffDetails}>
                  <Text style={s.staffName} numberOfLines={1}>
                    {currentUser?.name ||
                      user?.name ||
                      t("common.staffMember", "Staff Member")}
                  </Text>
                  <View style={s.staffMetaRow}>
                    <Text style={s.staffMetaText}>
                      {t("attendance.staffId", "Staff ID")}:{" "}
                      <Text style={s.staffMetaBold}>
                        {currentUser?.id || user?.id || "—"}
                      </Text>
                    </Text>
                    {/* <Text style={s.staffMetaDot}>•</Text> */}
                    <Text style={s.staffMetaText} numberOfLines={1}>
                      {t("account.position", "Position")}:{" "}
                      <Text
                        style={s.staffMetaBold}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {currentUser?.position || user?.position || "Staff"}
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>

              {/* Error Message Alert */}
              {errorMessage && (
                <View style={s.errorBox}>
                  <MaterialIcons
                    name="error-outline"
                    size={16}
                    color={theme.colors.error}
                  />
                  <Text style={s.errorText}>{errorMessage}</Text>
                </View>
              )}

              {/* From Date & Time */}
              <View style={s.dateTimeRow}>
                <View style={s.dateTimeCol}>
                  <Text style={s.inputLabel}>
                    {t("home.fromDate", "From Date")}{" "}
                    <Text style={s.requiredStar}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={s.pickerBtn}
                    onPress={() => {
                      Keyboard.dismiss();
                      setDatePickerTarget("from");
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color={theme.colors.primary}
                      style={s.pickerIcon}
                    />
                    <View style={s.pickerTextContainer}>
                      <Text style={s.pickerMainText} numberOfLines={1}>
                        {formatDateDisplay(fromDate)}
                      </Text>
                      <Text style={s.pickerSubText}>
                        {t("home.selected", "Selected")}
                      </Text>
                    </View>
                    <MaterialIcons
                      name="arrow-drop-down"
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                <View style={s.dateTimeCol}>
                  <Text style={s.inputLabel}>
                    {t("home.fromTime", "From Time")}{" "}
                    <Text style={s.requiredStar}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={s.pickerBtn}
                    onPress={() => {
                      Keyboard.dismiss();
                      setTimePickerTarget("from");
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="time-outline"
                      size={18}
                      color={theme.colors.primary}
                      style={s.pickerIcon}
                    />
                    <View style={s.pickerTextContainer}>
                      <Text style={s.pickerMainText} numberOfLines={1}>
                        {fromTime}
                      </Text>
                      <Text style={s.pickerSubText}>
                        {t("home.selected", "Selected")}
                      </Text>
                    </View>
                    <MaterialIcons
                      name="arrow-drop-down"
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* To Date & Time */}
              <View style={s.dateTimeRow}>
                <View style={s.dateTimeCol}>
                  <Text style={s.inputLabel}>
                    {t("home.toDate", "To Date")}{" "}
                    <Text style={s.requiredStar}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={s.pickerBtn}
                    onPress={() => {
                      Keyboard.dismiss();
                      setDatePickerTarget("to");
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color={theme.colors.primary}
                      style={s.pickerIcon}
                    />
                    <View style={s.pickerTextContainer}>
                      <Text style={s.pickerMainText} numberOfLines={1}>
                        {formatDateDisplay(toDate)}
                      </Text>
                      <Text style={s.pickerSubText}>
                        {t("home.selected", "Selected")}
                      </Text>
                    </View>
                    <MaterialIcons
                      name="arrow-drop-down"
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                <View style={s.dateTimeCol}>
                  <Text style={s.inputLabel}>
                    {t("home.toTime", "To Time")}{" "}
                    <Text style={s.requiredStar}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={s.pickerBtn}
                    onPress={() => {
                      Keyboard.dismiss();
                      setTimePickerTarget("to");
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="time-outline"
                      size={18}
                      color={theme.colors.primary}
                      style={s.pickerIcon}
                    />
                    <View style={s.pickerTextContainer}>
                      <Text style={s.pickerMainText} numberOfLines={1}>
                        {toTime}
                      </Text>
                      <Text style={s.pickerSubText}>
                        {t("home.selected", "Selected")}
                      </Text>
                    </View>
                    <MaterialIcons
                      name="arrow-drop-down"
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Subject Input & Quick Presets */}
              <View style={s.inputGroup}>
                <View style={s.labelWithQuickRow}>
                  <Text style={s.inputLabel}>
                    {t("home.subject", "Subject")}{" "}
                    <Text style={s.requiredStar}>*</Text>
                  </Text>
                </View>

                <View style={s.inputBox}>
                  <MaterialIcons
                    name="edit"
                    size={18}
                    color={theme.colors.grey}
                    style={s.inputIcon}
                  />
                  <TextInput
                    style={s.textInput}
                    placeholder={t(
                      "home.subjectPlaceholder",
                      "Enter request subject...",
                    )}
                    placeholderTextColor={theme.colors.grey}
                    value={subject}
                    onChangeText={(val) => {
                      setSubject(val);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    onFocus={() => {
                      setTimeout(() => {
                        scrollRef.current?.scrollTo({ y: 50, animated: true });
                      }, 150);
                    }}
                    returnKeyType="next"
                  />
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.quickChipsRow}
                >
                  {QUICK_SUBJECTS.map((item) => {
                    const isSelected = subject === item;
                    const translatedItem =
                      item === "Forgot Check-In"
                        ? t("home.quickSubjects.forgotCheckIn", item)
                        : item === "Forgot Check-Out"
                          ? t("home.quickSubjects.forgotCheckOut", item)
                          : item === "Late Check-In"
                            ? t("home.quickSubjects.lateCheckIn", item)
                            : item === "Work Outside"
                              ? t("home.quickSubjects.workOutside", item)
                              : item === "Leave Request"
                                ? t("home.quickSubjects.leaveRequest", item)
                                : item;
                    return (
                      <TouchableOpacity
                        key={item}
                        style={[s.quickChip, isSelected && s.quickChipSelected]}
                        onPress={() => {
                          setSubject(item);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            s.quickChipText,
                            isSelected && s.quickChipTextSelected,
                          ]}
                        >
                          {translatedItem}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Remark Input */}
              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>
                  {t("home.remark", "Remark")}{" "}
                  <Text style={s.requiredStar}>*</Text>
                </Text>
                <View style={[s.inputBox, s.textAreaBox]}>
                  <TextInput
                    style={[s.textInput, s.textAreaInput]}
                    placeholder={t(
                      "home.remarkRequestPlaceholder",
                      "Enter reason or details for this request...",
                    )}
                    placeholderTextColor={theme.colors.grey}
                    value={remark}
                    onChangeText={(val) => {
                      setRemark(val);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    onFocus={() => {
                      setTimeout(() => {
                        scrollRef.current?.scrollToEnd({ animated: true });
                      }, 150);
                    }}
                    multiline={true}
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Proof Photo Upload Component (DRY & SOLID) */}
              <ProofImageUpload
                imageUri={imageUri}
                onPressUpload={() => setImageSourceModalVisible(true)}
                onRemoveImage={handleRemoveImage}
                disabled={submitting}
                error={imageError}
                label={t("home.proofPhotoOptional", "Proof Photo (Optional)")}
              />
            </ScrollView>

            {/* Pinned Footer (Cancel and Submit) - Shared with EditAttendanceModal */}
            <View style={s.footerContainer}>
              <ModalFooterButtons
                onClose={handleClose}
                onSubmit={handleOpenConfirm}
                closeText={t("common.cancel", "Cancel")}
                submitText={t("common.submit", "Submit")}
                submitting={submitting}
                disabled={!subject.trim() || !remark.trim() || submitting}
                iconName="send-outline"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={datePickerTarget !== null}
        value={datePickerTarget === "to" ? toDate : fromDate}
        onClose={() => setDatePickerTarget(null)}
        onChange={(d) => {
          if (datePickerTarget === "from") {
            setFromDate(d);
            if (toDate.getTime() < d.getTime()) {
              setToDate(d);
            }
          } else if (datePickerTarget === "to") {
            setToDate(d);
          }
          setDatePickerTarget(null);
        }}
        allowFuture={true}
      />

      {/* Time Picker Modal */}
      <TimePickerModal
        visible={timePickerTarget !== null}
        value={timePickerTarget === "to" ? toTime : fromTime}
        onClose={() => setTimePickerTarget(null)}
        onChange={(t) => {
          if (timePickerTarget === "from") {
            setFromTime(t);
          } else if (timePickerTarget === "to") {
            setToTime(t);
          }
          setTimePickerTarget(null);
        }}
      />

      {/* Image Source Selection Modal */}
      <ImageSourceModal
        visible={imageSourceModalVisible}
        onClose={() => setImageSourceModalVisible(false)}
        onSelectCamera={() => {
          setImageSourceModalVisible(false);
          handlePickImage(true);
        }}
        onSelectGallery={() => {
          setImageSourceModalVisible(false);
          handlePickImage(false);
        }}
      />

      {/* Confirmation Modal Component (SRP) */}
      <RequestConfirmModal
        visible={confirmModalVisible}
        onClose={() => setConfirmModalVisible(false)}
        onConfirm={handleConfirmSubmit}
        submitting={submitting}
        userName={currentUser?.name || user?.name || "Staff"}
        userId={currentUser?.id || user?.id || "—"}
        subject={subject}
        remark={remark}
        fromDate={fromDate}
        toDate={toDate}
        fromTime={fromTime}
        toTime={toTime}
        imageUri={imageUri}
      />

      {/* Shared Alert Modal */}
      {renderAlertModal({
        alertModalVisible,
        setAlertModalVisible: handleAlertDismiss,
        title: alertTitle,
        bodyTxt: alertBody,
        onPress: alertOnPress,
        isMobile,
      })}
    </>
  );
}

export default RequestAttendanceModal;
