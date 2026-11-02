import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Typography } from "@/components/ui/Typography";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { LoginCredentials } from "../types/auth.types";

export interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false,
  errorMessage,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const handleSubmit = async () => {
    const errors: { username?: string; password?: string } = {};
    if (!username.trim()) {
      errors.username = "Username is required";
    }
    if (!password) {
      errors.password = "Password is required";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    await onSubmit({ username: username.trim(), password });
  };

  return (
    <View style={styles.container}>
      {errorMessage && (
        <View style={styles.errorBanner}>
          <Typography variant="bodySmall" color="#FF3B30">
            {errorMessage}
          </Typography>
        </View>
      )}

      <Input
        label="Username"
        placeholder="Enter your username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        error={validationErrors.username}
      />

      <Input
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={validationErrors.password}
      />

      <Button
        label="Sign In"
        onPress={handleSubmit}
        isLoading={isLoading}
        style={styles.submitButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  errorBanner: {
    backgroundColor: "#FFEBEA",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 16,
  },
});
