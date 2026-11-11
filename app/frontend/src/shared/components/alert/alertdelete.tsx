import { useLanguage } from "@/features/language";
import { ModalFooterButtons } from "@/shared/components/button/ModalFooterButtons";
import { theme } from "@/shared/styles/theme";
import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

export interface AlertDeleteModalProps {
  alertModalVisible: boolean;
  setAlertModalVisible: (visible: boolean) => void;
  title: string;
  bodyTxt: string;
  deleteAction: () => Promise<void> | void;
  isDeleting?: boolean;
  isMobile?: boolean;
  cancelText?: string;
  deleteText?: string;
}

export const AlertDeleteModal: React.FC<AlertDeleteModalProps> = ({
  alertModalVisible,
  setAlertModalVisible,
  title,
  bodyTxt,
  deleteAction,
  isDeleting = false,
  isMobile = false,
  cancelText,
  deleteText,
}) => {
  const { t } = useLanguage();
  const resolvedCancelText = cancelText ?? t("common.cancel");
  const resolvedDeleteText = deleteText ?? t("common.delete");
  const resolvedDeletingText = t("common.deleting");

  return (
    <Modal
      visible={alertModalVisible}
      animationType="fade"
      transparent
      onRequestClose={() => {
        if (!isDeleting) setAlertModalVisible(false);
      }}
      statusBarTranslucent
    >
      <View style={styles.conModalLogout}>
        <View
          style={[
            styles.conModal,
            {
              maxWidth: !isMobile ? 400 : "94%",
              width: !isMobile ? 400 : "94%",
            },
          ]}
        >
          <Text style={[styles.txt, { fontSize: theme.fontSizes.xl }]}>
            {title}
          </Text>
          <Text style={styles.txt}>{bodyTxt}</Text>

          <ModalFooterButtons
            onClose={() => setAlertModalVisible(false)}
            onSubmit={async () => {
              await deleteAction();
            }}
            closeText={resolvedCancelText}
            submitText={isDeleting ? resolvedDeletingText : resolvedDeleteText}
            submitting={isDeleting}
            variant="danger"
            iconName="trash-outline"
            noBorderTop
          />
        </View>
      </View>
    </Modal>
  );
};

export const renderAlertDeleteModal = (props: AlertDeleteModalProps) => (
  <AlertDeleteModal {...props} />
);

const styles = StyleSheet.create({
  conModalLogout: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  conModal: {
    marginHorizontal: 20,
    backgroundColor: theme.colors.background2,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.xl,
    alignSelf: "center",
    gap: 16,
  },
  txt: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.md,
    textAlign: "center",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
