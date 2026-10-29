import AppbarBack from "@/components/appbar/appbarback";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Step = "email" | "otp" | "newPassword";

const ForgotPassword = () => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    setStep("otp");
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert("Error", "Please enter the code sent to your email");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: "recovery",
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    setStep("newPassword");
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Success", "Password updated successfully", [
      {
        text: "OK",
        onPress: () => {
          // sign out so they log back in with the new password on the login screen
          supabase.auth.signOut();
          router.replace("/login/login"); // adjust to your login route
        },
      },
    ]);
  };

  return (
    <>
      {/* <SafeAreaView style={styles.container}> */}
      <AppbarBack Title="Forgot Password" />

      <View style={styles.content}>
        {step === "email" && (
          <>
            <Text style={styles.label}>Enter your email</Text>
            <Text style={styles.subLabel}>
              We'll send a verification code to reset your password.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleSendCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send Code</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {step === "otp" && (
          <>
            <Text style={styles.label}>Enter verification code</Text>
            <Text style={styles.subLabel}>We sent a code to {email}</Text>
            <TextInput
              style={styles.input}
              placeholder="6-digit code"
              placeholderTextColor="#999"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify Code</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSendCode} disabled={loading}>
              <Text style={styles.resendText}>Resend code</Text>
            </TouchableOpacity>
          </>
        )}

        {step === "newPassword" && (
          <>
            <Text style={styles.label}>Set new password</Text>
            <TextInput
              style={styles.input}
              placeholder="New password"
              placeholderTextColor="#999"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleUpdatePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
      {/* </SafeAreaView> */}
    </>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background2,
  },
  content: {
    padding: 20,
    marginTop: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  subLabel: {
    fontSize: 14,
    color: "#777",
    marginBottom: 20,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    fontSize: 16,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  button: {
    backgroundColor: AppColors.background2,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  resendText: {
    textAlign: "center",
    marginTop: 14,
    color: "#007AFF",
  },
});
