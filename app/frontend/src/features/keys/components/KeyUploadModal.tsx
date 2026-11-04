import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Modal } from "@/shared/components/ui/Modal";
import { Typography } from "@/shared/components/ui/Typography";
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
  const [name, setName] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Key name is required");
      return;
    }
    if (!isValidSshPublicKey(publicKey)) {
      setError(
        "Invalid SSH Public Key format. Must start with ssh-rsa, ssh-ed25519, or ecdsa.",
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
      setError(err?.message || "Failed to upload key");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <Typography variant="h3" style={styles.title}>
        Add SSH Public Key
      </Typography>

      {error && (
        <Typography variant="bodySmall" color="#FF3B30" style={styles.error}>
          {error}
        </Typography>
      )}

      <Input
        label="Key Name / Identifier"
        placeholder="e.g. MacBook Pro - Work"
        value={name}
        onChangeText={setName}
      />

      <Input
        label="Public Key String"
        placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5..."
        value={publicKey}
        onChangeText={setPublicKey}
        multiline
        numberOfLines={4}
        inputStyle={styles.keyInput}
      />

      <View style={styles.actions}>
        <Button
          label="Cancel"
          variant="outline"
          onPress={onClose}
          style={styles.actionBtn}
        />
        <Button
          label="Upload Key"
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
    marginBottom: 16,
  },
  error: {
    marginBottom: 8,
  },
  keyInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
  },
});
