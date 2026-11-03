import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
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
          placeholderTextColor={AppColors.grey}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <MaterialIcons
          name="person"
          size={20}
          color={AppColors.secondary}
          style={styles.inputIcon}
        />
      </View>

      <View style={[styles.inputContainer, { marginTop: 18 }]}>
        <TextInput
          style={styles.printInput}
          value={password}
          onChangeText={onChangePassword}
          placeholder="password"
          placeholderTextColor={AppColors.grey}
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
            color={AppColors.secondary}
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
    backgroundColor: AppColors.background2,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: AppColors.secondary,
    paddingHorizontal: 12,
    color: AppColors.textPrimary,
    fontSize: 16,
    paddingRight: 40,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  inputIcon: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  txtError: {
    color: "#ff6b6b",
    fontSize: 13,
    marginTop: 10,
    textAlign: "center",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
});
