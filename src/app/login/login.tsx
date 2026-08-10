import { PrivacyPolicyModal } from "@/components/privacypolicy/PrivacyPolicyModal";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { AppImages } from "@/constants/appImages";
import { useUser } from "@/contexts/UserContext";
import { useResponsive } from "@/hooks/useResponsive";
import { userService } from "@/services/userService";
import { syncDeviceSession } from "@/utils/deviceSession";
import { supabase } from "@/utils/supabase";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import bcrypt from "bcryptjs";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const PRIVACY_ACCEPTED_KEY = "privacy_policy_accepted";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const { refresh } = useUser();
  const { isMobile } = useResponsive();

  const appVersion =
    Constants.expoConfig?.version || Constants.manifest?.version;

  useEffect(() => {
    AsyncStorage.getItem(PRIVACY_ACCEPTED_KEY).then((val: string | null) => {
      if (!val) setShowPrivacy(true);
    });
  }, []);

  const handlePrivacyAccept = async () => {
    await AsyncStorage.setItem(PRIVACY_ACCEPTED_KEY, "true");
    setShowPrivacy(false);
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const cleanInput = username.trim();
      const cleanInputPassword = password.trim();

      // Escape SQL wildcards (% and _) for ilike pattern matching
      const escapedInput = cleanInput.replace(/[%_\\]/g, "\\$&");

      // Search by username OR email using ilike (case-insensitive)
      const { data, error: dbError } = await supabase
        .from("ssh_group_staff_users")
        .select(
          "id, name, role, username, password, email, phone, position, devices",
        )
        .or(`username.ilike.${escapedInput},email.ilike.${escapedInput}`)
        .maybeSingle();

      if (dbError) {
        // This branch ONLY fires for real DB/RLS errors, not "no rows".
        console.warn("Login DB error:", dbError.code, dbError.message);
        if (
          dbError.code === "42501" ||
          dbError.message?.includes("permission")
        ) {
          setError("Server permission error. Contact admin.");
        } else if (dbError.code === "PGRST116") {
          // Multiple rows matched — duplicate usernames in the table
          setError("Account conflict. Contact admin.");
        } else {
          setError("Unable to reach server. Try again.");
        }
        return;
      }

      if (!data) {
        console.warn("Login: no user row found for input:", cleanInput);
        setError("Invalid username or password.");
        return;
      }

      if ((data as any).is_active === false) {
        setError("Your account is inactive. Contact admin.");
        return;
      }

      let isMatch = false;
      const storedPassword = (data.password || "").trim();
      const normalizedHash = storedPassword.replace(/^\$2y\$/, "$2a$");

      // 1. Check plaintext match (raw or trimmed password)
      if (
        storedPassword === password ||
        storedPassword === cleanInputPassword
      ) {
        isMatch = true;
      } else if (storedPassword.startsWith("$2")) {
        // 2. Check bcrypt hash (compareSync with normalized and raw hashes)
        try {
          isMatch =
            bcrypt.compareSync(cleanInputPassword, normalizedHash) ||
            bcrypt.compareSync(password, normalizedHash) ||
            bcrypt.compareSync(cleanInputPassword, storedPassword) ||
            bcrypt.compareSync(password, storedPassword);
        } catch (e) {
          console.warn("bcrypt.compareSync error, trying async compare:", e);
          try {
            const resClean = await bcrypt.compare(
              cleanInputPassword,
              normalizedHash,
            );
            const resRaw = await bcrypt.compare(password, normalizedHash);
            isMatch = Boolean(resClean || resRaw);
          } catch (asyncErr) {
            console.warn("bcrypt.compare async error:", asyncErr);
          }
        }
      } else {
        console.warn(
          "Login: stored password is neither plaintext match nor bcrypt hash for user:",
          cleanInput,
        );
      }

      if (!isMatch) {
        console.warn("Login: password mismatch for user:", cleanInput);
        setError("Invalid username or password.");
        return;
      }

      const { password: _pw, ...safeUser } = data;
      await userService.save(safeUser);

      try {
        await syncDeviceSession(safeUser.id, true);
      } catch (err) {
        console.warn("Failed to sync device session during login:", err);
      }

      await refresh();
      router.replace("/");
    } catch (err: any) {
      console.error("Unexpected login error:", err);
      setError("An unexpected error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar translucent barStyle="light-content" />
      <PrivacyPolicyModal
        visible={showPrivacy}
        onAccept={handlePrivacyAccept}
      />

      <View style={styles.container}>
        <LinearGradient
          colors={[
            AppColors.secondary,
            AppColors.background,
            AppColors.secondary,
          ]}
          start={isMobile ? { x: 1, y: 0 } : { x: 1, y: 0 }}
          end={isMobile ? { x: 0, y: 1 } : { x: 0, y: 1 }}
          locations={[0.2, 0.6, 0.9]}
          style={styles.gradient}
        >
          <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            enableOnAndroid={true}
            extraScrollHeight={20}
            showsVerticalScrollIndicator={false}
            style={styles.conWrapper}
            contentContainerStyle={styles.conWrapperContent}
          >
            <View
              style={[styles.conDesign, { width: isMobile ? "100%" : "40%" }]}
            >
              <View style={styles.conLogo}>
                <Image source={AppImages.logoStaffY} style={styles.imgLogo} />
              </View>

              <View style={styles.conTxt}>
                <Text style={styles.txtApp}>SSH Group Staff</Text>
                <Text style={styles.subTxt}>
                  Please enter your username and password SSH-Group Account to
                  login.
                </Text>
              </View>

              <View style={styles.conInput}>
                <View style={{ position: "relative" }}>
                  <TextInput
                    style={styles.printInput}
                    value={username}
                    onChangeText={(v) => {
                      setUsername(v);
                      setError(null);
                    }}
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

                <View style={{ marginTop: 18, position: "relative" }}>
                  <TextInput
                    style={styles.printInput}
                    value={password}
                    onChangeText={(v) => {
                      setPassword(v);
                      setError(null);
                    }}
                    placeholder="password"
                    placeholderTextColor={AppColors.grey}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    textContentType="password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
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

                {error && <Text style={styles.txtError}>{error}</Text>}
              </View>

              <TouchableOpacity
                onPress={() => setShowPrivacy(true)}
                style={styles.privacyLink}
                activeOpacity={0.7}
              >
                <Text style={styles.privacyLinkText}>Privacy & Policy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogin}
                style={[styles.conBtn, loading && { opacity: 0.7 }]}
                disabled={loading}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {loading ? (
                    <>
                      <ActivityIndicator
                        size={24}
                        color={AppColors.background2}
                      />
                      <Text style={styles.txtBtn}>Login...</Text>
                    </>
                  ) : (
                    <>
                      <AntDesign
                        name="logout"
                        size={18}
                        color={AppColors.background2}
                      />
                      <Text style={styles.txtBtn}>Login</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>

              <Text style={[styles.txtCopy, { marginBottom: 0 }]}>
                Version : {appVersion}
              </Text>
              <Text style={[styles.txtCopy, { marginTop: 2, marginBottom: 0 }]}>
                WWW.SSHGROUPS.COM
              </Text>
              <Text style={[styles.txtCopy, { marginTop: 0 }]}>
                © 2026 SSH Group | All Rights Reserved
              </Text>
            </View>
          </KeyboardAwareScrollView>
        </LinearGradient>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  gradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  conWrapper: {
    flex: 1,
    width: "100%",
  },
  conWrapperContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  conDesign: {
    backgroundColor: AppColors.background2,
    borderRadius: 15,
    width: "100%",
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    borderColor: AppColors.secondary,
    borderWidth: 1.5,
  },
  conLogo: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    // borderRadius: 11.7,
    // borderColor: AppColors.secondary,
    // borderWidth: 2,
  },
  imgLogo: {
    width: "100%",
    height: "100%",
  },
  conTxt: {
    marginVertical: 20,
  },
  txtApp: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: AppColors.secondary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  subTxt: {
    fontSize: 13,
    marginTop: 10,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  conInput: {
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
  privacyLink: {
    marginTop: 14,
    paddingVertical: 6,
  },
  privacyLinkText: {
    color: AppColors.secondary,
    fontSize: 13,
    textDecorationLine: "underline",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    textAlign: "center",
  },
  conBtn: {
    height: 48,
    width: "100%",
    backgroundColor: AppColors.secondary,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  txtBtn: {
    color: AppColors.background2,
    fontWeight: "bold",
    marginLeft: 5,
    fontSize: 16,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  txtCopy: {
    color: AppColors.grey,
    fontSize: 13,
    marginTop: 20,
    fontWeight: "400",
    marginBottom: 20,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
});
