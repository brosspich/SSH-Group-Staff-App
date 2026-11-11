import { useLanguage } from "@/features/language";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Modal } from "@/shared/components/ui/Modal";
import { Typography } from "@/shared/components/ui/Typography";
import { theme } from "@/shared/styles/theme";
import { isValidSshPublicKey } from "@/utils/validators";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { UploadKeyDTO } from "../types/key.types";

export interface KeyUploadModalProps {
  isVisible: boolean;
  onClose: () => void;
  onUpload: (dto: UploadKeyDTO) => Promise<void>;
}

export const KeyUploadModal: React.FC<KeyUploadModalProps> = ({
  isVisible,
  onClose,
  onUpload,
}) => {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError(t("keys.keyNameRequired", "Key name is required"));
      return;
    }
    if (!isValidSshPublicKey(publicKey)) {
      setError(
        t(
          "keys.invalidKeyFormat",
          "Invalid SSH Public Key format. Must start with ssh-rsa, ssh-ed25519, or ecdsa.",
        ),
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onUpload({ name: name.trim(), publicKey: publicKey.trim() });
      setName("");
      setPublicKey("");
      onClose();
    } catch (err: any) {
      setError(
        err?.message || t("keys.uploadKeyFailed", "Failed to upload key"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <Typography variant="h3" style={styles.title}>
        {t("keys.addSshKey", "Add SSH Public Key")}
      </Typography>

      {error && (
        <Typography
          variant="bodySmall"
          color={theme.colors.error}
          style={styles.error}
        >
          {error}
        </Typography>
      )}

      <Input
        label={t("keys.keyName", "Key Name / Identifier")}
        placeholder={t("keys.keyNamePlaceholder", "e.g. MacBook Pro - Work")}
        value={name}
        onChangeText={setName}
      />

      <Input
        label={t("keys.publicKeyString", "Public Key String")}
        placeholder={t(
          "keys.publicKeyPlaceholder",
          "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5...",
        )}
        value={publicKey}
        onChangeText={setPublicKey}
        multiline
        numberOfLines={4}
        inputStyle={styles.keyInput}
      />

      <View style={styles.actions}>
        <Button
          label={t("common.cancel", "Cancel")}
          variant="outline"
          onPress={onClose}
          style={styles.actionBtn}
        />
        <Button
          label={t("keys.uploadKey", "Upload Key")}
          onPress={handleSubmit}
          isLoading={isSubmitting}
          style={styles.actionBtn}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: theme.spacing.md,
  },
  error: {
    marginBottom: theme.spacing.sm,
  },
  keyInput: {
    height: 100,
    textAlignVertical: "top",
    fontFamily: "Courier",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  actionBtn: {
    minWidth: 100,
  },
});
