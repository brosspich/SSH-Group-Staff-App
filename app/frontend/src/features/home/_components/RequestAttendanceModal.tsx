import DatePickerModal from "@/shared/components/daterangpicker/DatePickerModal";
import TimePickerModal from "@/shared/components/daterangpicker/TimePickerModal";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import {
  formatTimeDisplay,
  getOfficialTimeIn,
  getOfficialTimeOut,
} from "@/constants/attendanceConfig";
import { useResponsive } from "@/hooks/useResponsive";
import { submitAttendanceRequest } from "@/services/attendanceRequestService";
import { StaffUser, userService } from "@/services/userService";
import { renderAlertModal } from "@/shared/components/alert/alert";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function formatDateDisplay(date: Date): string {
  const d = date.getDate();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
}

function formatDateYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getDefaultTime(): string {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes();
  const p = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${p}`;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

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
  }) => Promise<void> | void;
}

export function RequestAttendanceModal({
  visible,
  onClose,
  user,
  onSubmit,
}: RequestAttendanceModalProps) {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsive();
  const { height: windowHeight } = useWindowDimensions();

  const [currentUser, setCurrentUser] = useState<StaffUser | null>(
    user || null,
  );

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    } else {
      userService.get().then((u) => {
        if (u) setCurrentUser(u);
      });
    }
  }, [user, visible]);

  // From Date & Time (defaults to today and official Time-In from database)
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [fromTime, setFromTime] = useState<string>(() =>
    formatTimeDisplay(getOfficialTimeIn(), "08:00 AM"),
  );

  // To Date & Time (defaults to today and official Time-Out from database)
  const [toDate, setToDate] = useState<Date>(new Date());
  const [toTime, setToTime] = useState<string>(() =>
    formatTimeDisplay(getOfficialTimeOut(), "05:00 PM"),
  );

  // Picker target states: 'from' | 'to' | null
  const [datePickerTarget, setDatePickerTarget] = useState<
    "from" | "to" | null
  >(null);
  const [timePickerTarget, setTimePickerTarget] = useState<
    "from" | "to" | null
  >(null);

  const [subject, setSubject] = useState("");
  const [remark, setRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Confirmation Modal state
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  // Custom Alert Modal states
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertBody, setAlertBody] = useState("");
  const [alertOnPress, setAlertOnPress] = useState<(() => void) | undefined>(
    undefined,
  );

  const scrollRef = useRef<ScrollView>(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (visible) {
      const now = new Date();
      setFromDate(now);
      setFromTime(formatTimeDisplay(getOfficialTimeIn(), "08:00 AM"));
      setToDate(now);
      setToTime(formatTimeDisplay(getOfficialTimeOut(), "05:00 PM"));
      setDatePickerTarget(null);
      setTimePickerTarget(null);
      setSubject("");
      setRemark("");
      setErrorMessage(null);
      setSubmitting(false);
      isSubmittingRef.current = false;
      setKeyboardHeight(0);
      setConfirmModalVisible(false);
      setAlertModalVisible(false);
      setAlertTitle("");
      setAlertBody("");
      setAlertOnPress(undefined);
    }
  }, [visible]);

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

  const handleClose = () => {
    Keyboard.dismiss();
    setConfirmModalVisible(false);
    onClose();
  };

  const handleAlertDismiss = (visible: boolean) => {
    setAlertModalVisible(visible);
    if (!visible && alertTitle === "Request Submitted") {
      handleClose();
    }
  };

  const handleOpenConfirm = () => {
    if (!subject.trim()) {
      setErrorMessage("Please enter a subject.");
      return;
    }
    if (!remark.trim()) {
      setErrorMessage("Please enter a remark.");
      return;
    }

    const targetUser = currentUser || user;
    if (!targetUser?.id) {
      setErrorMessage("User information not found. Please log in again.");
      return;
    }

    setErrorMessage(null);
    Keyboard.dismiss();
    setConfirmModalVisible(true);
  };

  const handleConfirmSubmit = async () => {
    if (isSubmittingRef.current) return;
    const targetUser = currentUser || user;
    if (!targetUser?.id) {
      setErrorMessage("User information not found. Please log in again.");
      setConfirmModalVisible(false);
      return;
    }

    isSubmittingRef.current = true;
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const fromDateStr = formatDateYMD(fromDate);
      const toDateStr = formatDateYMD(toDate);

      // Save directly to Backend API table ssh_group_staff_users (request_attendance_rules column)
      // and send notification to Telegram
      await submitAttendanceRequest({
        user: targetUser,
        fromDate: fromDateStr,
        fromTime,
        toDate: toDateStr,
        toTime,
        subject: subject.trim(),
        remark: remark.trim(),
      });

      // Also invoke optional callback if provided
      if (onSubmit) {
        await onSubmit({
          subject: subject.trim(),
          remark: remark.trim(),
          date: fromDateStr,
          time: fromTime,
          fromDate: fromDateStr,
          fromTime,
          toDate: toDateStr,
          toTime,
        });
      }

      setConfirmModalVisible(false);
      setAlertTitle("Request Submitted");
      setAlertBody(
        "Your attendance request has been saved and sent to Telegram successfully.",
      );
      setAlertOnPress(() => () => {
        handleClose();
      });
      setAlertModalVisible(true);
    } catch (err: any) {
      console.warn("Error submitting attendance request:", err);
      setConfirmModalVisible(false);
      setAlertTitle("Submission Failed");
      setAlertBody(
        err?.message ||
          "Failed to submit attendance request. Please try again.",
      );
      setAlertOnPress(undefined);
      setAlertModalVisible(true);
    } finally {
      setSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  // Calculate maximum allowed height so modal never overflows top when keyboard opens
  const maxSheetHeight =
    keyboardHeight > 0
      ? windowHeight - keyboardHeight - insets.top - 20
      : windowHeight * 0.85;

  return (
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
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
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
                  color={AppColors.primary}
                />
              </View>
              <Text style={s.headerTitle}>Request Attendance</Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={s.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons
                name="close"
                size={22}
                color={AppColors.textSecondary}
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
            {/* ── Display Staff Info (id, name, position) ── */}
            <View style={s.staffCard}>
              <View style={s.avatarCircle}>
                <Ionicons name="person" size={20} color={AppColors.primary} />
              </View>
              <View style={s.staffDetails}>
                <Text style={s.staffName} numberOfLines={1}>
                  {currentUser?.name || user?.name || "Staff Member"}
                </Text>
                <View style={s.staffMetaRow}>
                  <Text style={s.staffMetaText}>
                    ID:{" "}
                    <Text style={s.staffMetaBold}>
                      {currentUser?.id || user?.id || "—"}
                    </Text>
                  </Text>
                  <Text style={s.staffMetaDot}>•</Text>
                  <Text style={s.staffMetaText} numberOfLines={1}>
                    Position:{" "}
                    <Text style={s.staffMetaBold}>
                      {currentUser?.position || user?.position || "Staff"}
                    </Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* Error Alert Message */}
            {errorMessage && (
              <View style={s.errorBox}>
                <MaterialIcons name="error-outline" size={16} color="#dc2626" />
                <Text style={s.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* ── Attendance From & To Selection ── */}
            {/* From Date & Time */}
            <View style={s.dateTimeRow}>
              {/* From Date Selector */}
              <View style={s.dateTimeCol}>
                <Text style={s.inputLabel}>
                  Date <Text style={s.requiredStar}>*</Text>
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
                    color={AppColors.primary}
                    style={s.pickerIcon}
                  />
                  <View style={s.pickerTextContainer}>
                    <Text style={s.pickerMainText} numberOfLines={1}>
                      {formatDateDisplay(fromDate)}
                    </Text>
                    <Text style={s.pickerSubText}>
                      {isSameDay(fromDate, new Date())
                        ? "Today"
                        : formatDateYMD(fromDate)}
                    </Text>
                  </View>
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={20}
                    color={AppColors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* From Time Selector */}
              <View style={s.dateTimeCol}>
                <Text style={s.inputLabel}>
                  Time <Text style={s.requiredStar}>*</Text>
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
                    color={AppColors.primary}
                    style={s.pickerIcon}
                  />
                  <View style={s.pickerTextContainer}>
                    <Text style={s.pickerMainText} numberOfLines={1}>
                      {fromTime}
                    </Text>
                    <Text style={s.pickerSubText}>Selected</Text>
                  </View>
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={20}
                    color={AppColors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* To Date & Time */}
            <View style={s.dateTimeRow}>
              {/* To Date Selector */}
              <View style={s.dateTimeCol}>
                <Text style={s.inputLabel}>
                  To Date <Text style={s.requiredStar}>*</Text>
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
                    color={AppColors.primary}
                    style={s.pickerIcon}
                  />
                  <View style={s.pickerTextContainer}>
                    <Text style={s.pickerMainText} numberOfLines={1}>
                      {formatDateDisplay(toDate)}
                    </Text>
                    <Text style={s.pickerSubText}>
                      {isSameDay(toDate, fromDate)
                        ? "Same Day"
                        : isSameDay(toDate, new Date())
                          ? "Today"
                          : formatDateYMD(toDate)}
                    </Text>
                  </View>
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={20}
                    color={AppColors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* To Time Selector */}
              <View style={s.dateTimeCol}>
                <Text style={s.inputLabel}>
                  To Time <Text style={s.requiredStar}>*</Text>
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
                    color={AppColors.primary}
                    style={s.pickerIcon}
                  />
                  <View style={s.pickerTextContainer}>
                    <Text style={s.pickerMainText} numberOfLines={1}>
                      {toTime}
                    </Text>
                    <Text style={s.pickerSubText}>Selected</Text>
                  </View>
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={20}
                    color={AppColors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Subject * (icon, quick presets and input) ── */}
            <View style={s.inputGroup}>
              <View style={s.labelWithQuickRow}>
                <Text style={s.inputLabel}>
                  Subject <Text style={s.requiredStar}>*</Text>
                </Text>
              </View>

              <View style={s.inputBox}>
                <MaterialIcons
                  name="edit"
                  size={18}
                  color={AppColors.grey}
                  style={s.inputIcon}
                />
                <TextInput
                  style={s.textInput}
                  placeholder="enter your subject"
                  placeholderTextColor={AppColors.grey}
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
            </View>

            {/* ── Remark * (icon and input) ── */}
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>
                Remark <Text style={s.requiredStar}>*</Text>
              </Text>
              <View style={[s.inputBox, s.textAreaBox]}>
                {/* <MaterialIcons
                  name="notes"
                  size={18}
                  color={AppColors.grey}
                  style={[s.inputIcon, { marginTop: 4 }]}
                /> */}
                <TextInput
                  style={[s.textInput, s.textAreaInput]}
                  placeholder="Enter reason or details for this request..."
                  placeholderTextColor={AppColors.grey}
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
          </ScrollView>

          {/* ── Pinned Footer (Cancel and Submit) ── */}
          <View style={s.footer}>
            <TouchableOpacity
              style={s.cancelBtn}
              onPress={handleClose}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Text style={s.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                s.submitBtn,
                (!subject.trim() || !remark.trim() || submitting) &&
                  s.submitBtnDisabled,
              ]}
              onPress={handleOpenConfirm}
              disabled={!subject.trim() || !remark.trim() || submitting}
              activeOpacity={0.85}
            >
              <Ionicons
                name="send-outline"
                size={16}
                color={AppColors.background2}
                style={{ marginRight: 6 }}
              />
              <Text style={s.submitBtnText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={datePickerTarget !== null}
        value={datePickerTarget === "to" ? toDate : fromDate}
        onClose={() => setDatePickerTarget(null)}
        onChange={(d) => {
          if (datePickerTarget === "from") {
            setFromDate(d);
            // If toDate is before new fromDate, auto-sync toDate
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

      {/* ── Success Confirmation Modal ── */}
      <Modal
        visible={confirmModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          if (!submitting) {
            setConfirmModalVisible(false);
          }
        }}
      >
        <View style={s.confirmOverlay}>
          <View style={s.confirmCard}>
            <View style={s.confirmIconCircle}>
              <Ionicons
                name="checkmark"
                size={40}
                color={AppColors.background2}
              />
            </View>

            <Text style={s.confirmTitle}>
              {submitting ? "Submitting Request..." : "Confirm Request"}
            </Text>

            <View style={s.confirmDetails}>
              <View style={s.confirmDetailRow}>
                <Text style={s.confirmDetailLabel}>Staff Name:</Text>
                <Text style={s.confirmDetailValue} numberOfLines={1}>
                  {(currentUser || user)?.name || "N/A"}
                </Text>
              </View>

              <View style={s.confirmDetailRow}>
                <Text style={s.confirmDetailLabel}>Staff ID:</Text>
                <Text style={s.confirmDetailValue}>
                  {(currentUser || user)?.staff_id ||
                    (currentUser || user)?.id ||
                    "N/A"}
                </Text>
              </View>

              <View style={s.confirmDetailRow}>
                <Text style={s.confirmDetailLabel}>Subject:</Text>
                <Text
                  style={[
                    s.confirmDetailValue,
                    { flex: 1, textAlign: "right" },
                  ]}
                  numberOfLines={2}
                >
                  {subject.trim()}
                </Text>
              </View>

              <View style={s.confirmDetailRow}>
                <Text style={s.confirmDetailLabel}>Remark:</Text>
                <Text
                  style={[
                    s.confirmDetailValue,
                    { flex: 1, textAlign: "right" },
                  ]}
                  numberOfLines={3}
                >
                  {remark.trim()}
                </Text>
              </View>

              <View style={s.confirmDetailRow}>
                <Text style={s.confirmDetailLabel}>Date:</Text>
                <Text style={s.confirmDetailValue}>
                  {isSameDay(fromDate, toDate)
                    ? formatDateYMD(fromDate)
                    : `${formatDateYMD(fromDate)} to ${formatDateYMD(toDate)}`}
                </Text>
              </View>

              <View style={s.confirmDetailRow}>
                <Text style={s.confirmDetailLabel}>Time:</Text>
                <Text style={s.confirmDetailValue}>
                  {`${fromTime} - ${toTime}`}
                </Text>
              </View>
            </View>

            <View style={{ width: "100%", gap: 10 }}>
              <TouchableOpacity
                style={s.confirmSubmitBtn}
                onPress={handleConfirmSubmit}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator
                    size="small"
                    color={AppColors.background2}
                  />
                ) : (
                  <>
                    <Ionicons
                      name="send-outline"
                      size={16}
                      color={AppColors.background2}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={s.confirmBtnText}>Submit</Text>
                  </>
                )}
              </TouchableOpacity>

              {!submitting && (
                <TouchableOpacity
                  style={s.confirmCancelBtn}
                  onPress={() => setConfirmModalVisible(false)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[s.confirmBtnText, { color: AppColors.textPrimary }]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Alert Modal */}
      {renderAlertModal({
        alertModalVisible,
        setAlertModalVisible: handleAlertDismiss,
        title: alertTitle,
        bodyTxt: alertBody,
        onPress: alertOnPress,
        isMobile,
      })}
    </Modal>
  );
}

// Backward-compatible alias
export const RquestAttendanceModal = RequestAttendanceModal;

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: AppColors.background2,
    // paddingHorizontal: 20,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: `${AppColors.grey}70`,
    paddingHorizontal: 15,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconBadge: {
    width: 35,
    height: 35,
    borderRadius: 8,
    backgroundColor: `${AppColors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: `${AppColors.grey}15`,
  },
  scrollArea: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },

  // Display Staff Info
  staffCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.background,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: `${AppColors.grey}25`,
    gap: 10,
    marginHorizontal: 15,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${AppColors.primary}18`,
    alignItems: "center",
    justifyContent: "center",
  },
  staffDetails: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  staffMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    flexWrap: "wrap",
    gap: 6,
  },
  staffMetaText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  staffMetaBold: {
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    fontWeight: "600",
  },
  staffMetaDot: {
    fontSize: 10,
    color: AppColors.grey,
  },

  // Date & Time Row
  dateTimeRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 15,
  },
  dateTimeCol: {
    flex: 1,
    gap: 5,
  },
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.background,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: `${AppColors.grey}35`,
    minHeight: 46,
    gap: 4,
  },
  pickerIcon: {
    marginRight: 2,
  },
  pickerTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  pickerMainText: {
    fontSize: 12,
    fontFamily: AppFonts.bold,
    color: AppColors.textPrimary,
    includeFontPadding: false,
    letterSpacing: -0.2,
  },
  pickerSubText: {
    fontSize: 9.5,
    fontFamily: AppFonts.regular,
    color: AppColors.textSecondary,
    marginTop: 1,
    includeFontPadding: false,
  },

  // Input Group
  inputGroup: {
    gap: 5,
    paddingHorizontal: 15,
  },
  labelWithQuickRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quickSubjectRow: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 2,
  },
  quickSubjectChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: `${AppColors.grey}15`,
    borderWidth: 1,
    borderColor: `${AppColors.grey}25`,
  },
  quickSubjectChipActive: {
    backgroundColor: `${AppColors.primary}18`,
    borderColor: AppColors.primary,
  },
  quickSubjectText: {
    fontSize: 11,
    fontFamily: AppFonts.regular,
    color: AppColors.textSecondary,
    includeFontPadding: false,
  },
  quickSubjectTextActive: {
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    color: AppColors.primary,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: "600",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  requiredStar: {
    color: "#dc2626",
    fontWeight: "bold",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: `${AppColors.grey}35`,
    minHeight: 50,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    paddingVertical: 8,
    ...(Platform.OS === "web" &&
      ({ outlineStyle: "none", outlineWidth: 0 } as any)),
  },
  textAreaBox: {
    alignItems: "flex-start",
    minHeight: 76,
    paddingVertical: 8,
  },
  textAreaInput: {
    minHeight: 60,
    paddingVertical: 0,
  },

  // Error Message
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 6,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    fontSize: 12,
    color: "#dc2626",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    flex: 1,
  },

  // Pinned Footer Buttons
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 12,
    paddingBottom: 4,
    borderTopWidth: 0.5,
    borderTopColor: `${AppColors.grey}70`,
    paddingHorizontal: 15,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: `${AppColors.grey}15`,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: `${AppColors.grey}30`,
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  submitBtn: {
    flex: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: AppColors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // shadowColor: AppColors.primary,
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.25,
    // shadowRadius: 4,
    // elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    fontSize: 13.5,
    fontWeight: "bold",
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },

  // Confirmation Modal
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  confirmCard: {
    backgroundColor: AppColors.background2,
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
  },
  confirmIconCircle: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 14,
    backgroundColor: AppColors.secondary,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  confirmDetails: {
    width: "100%",
    backgroundColor: AppColors.background,
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    gap: 10,
  },
  confirmDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  confirmDetailLabel: {
    fontSize: 12.5,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  confirmDetailValue: {
    fontSize: 13.5,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  confirmSubmitBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: AppColors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmCancelBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: `${AppColors.grey}15`,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: `${AppColors.grey}30`,
  },
  confirmBtnText: {
    color: AppColors.background2,
    fontWeight: "bold",
    fontSize: 15,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
