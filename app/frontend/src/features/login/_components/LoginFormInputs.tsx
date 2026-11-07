import { theme } from "@/shared/styles/theme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface LoginFormInputsProps {
  username: string;
  onChangeUsername: (text: string) => void;
  password: string;
  onChangePassword: (text: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  error?: string | null;
}

export default function LoginFormInputs({
  username,
  onChangeUsername,
  password,
  onChangePassword,
  showPassword,
  onToggleShowPassword,
  error,
}: LoginFormInputsProps) {
  return (
    <View style={styles.conInput}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.printInput}
          value={username}
          onChangeText={onChangeUsername}
          placeholder="username"
          placeholderTextColor={theme.colors.grey}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <MaterialIcons
          name="person"
          size={20}
          color={theme.colors.secondary}
          style={styles.inputIcon}
        />
      </View>

      <View style={[styles.inputContainer, { marginTop: theme.spacing.lg }]}>
        <TextInput
          style={styles.printInput}
          value={password}
          onChangeText={onChangePassword}
          placeholder="password"
          placeholderTextColor={theme.colors.grey}
          secureTextEntry={!showPassword}
          autoComplete="password"
          textContentType="password"
        />
        <TouchableOpacity
          onPress={onToggleShowPassword}
          style={styles.eyeIcon}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color={theme.colors.secondary}
          />
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.txtError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  conInput: {
    width: "100%",
  },
  inputContainer: {
    position: "relative",
    width: "100%",
  },
  printInput: {
    height: 48,
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.md,
    paddingRight: 40,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  inputIcon: {
    position: "absolute",
    right: theme.spacing.md,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  eyeIcon: {
    position: "absolute",
    right: theme.spacing.md,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  txtError: {
    color: theme.colors.error,
    fontSize: theme.fontSizes.xs,
    marginTop: theme.spacing.sm,
    textAlign: "center",
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
});
