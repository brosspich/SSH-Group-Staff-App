import { AppColors } from "@/constants/appcolors";
import { PrivacyPolicyModal } from "@/features/login/_components/PrivacyPolicyModal";
import { useResponsive } from "@/hooks/useResponsive";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import LoginActionButtons from "./_components/LoginActionButtons";
import LoginFooterCopy from "./_components/LoginFooterCopy";
import LoginFormInputs from "./_components/LoginFormInputs";
import LoginHeaderBanner from "./_components/LoginHeaderBanner";
import { useLoginMutation } from "./_hooks/useLoginMutation";
import { useLoginStore } from "./_store/useLoginStore";
import { validateLoginInput } from "./_utils/loginUtils";

const PRIVACY_ACCEPTED_KEY = "privacy_policy_accepted";

export default function LoginScreen() {
  const { isMobile } = useResponsive();
  const [password, setPassword] = useState("");

  const username = useLoginStore((state) => state.username);
  const setUsername = useLoginStore((state) => state.setUsername);
  const showPassword = useLoginStore((state) => state.showPassword);
  const toggleShowPassword = useLoginStore((state) => state.toggleShowPassword);
  const showPrivacy = useLoginStore((state) => state.showPrivacy);
  const setShowPrivacy = useLoginStore((state) => state.setShowPrivacy);
  const error = useLoginStore((state) => state.error);
  const setError = useLoginStore((state) => state.setError);
  const isLoading = useLoginStore((state) => state.isLoading);
  const loadCachedUsername = useLoginStore((state) => state.loadCachedUsername);

  const loginMutation = useLoginMutation();

  useEffect(() => {
    loadCachedUsername();
    AsyncStorage.getItem(PRIVACY_ACCEPTED_KEY).then((val) => {
      if (!val) setShowPrivacy(true);
    });
  }, [loadCachedUsername, setShowPrivacy]);

  const handlePrivacyAccept = useCallback(async () => {
    try {
      await AsyncStorage.setItem(PRIVACY_ACCEPTED_KEY, "true");
    } catch {}
    setShowPrivacy(false);
  }, [setShowPrivacy]);

  const handleLogin = useCallback(() => {
    const validationError = validateLoginInput(username, password);
    if (validationError) {
      setError(validationError);
      return;
    }

    loginMutation.mutate({ username, password });
  }, [username, password, setError, loginMutation]);

  const isSubmitting = isLoading || loginMutation.isPending;

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
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
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
              <LoginHeaderBanner />

              <LoginFormInputs
                username={username}
                onChangeUsername={setUsername}
                password={password}
                onChangePassword={(val) => {
                  setPassword(val);
                  if (error) setError(null);
                }}
                showPassword={showPassword}
                onToggleShowPassword={toggleShowPassword}
                error={error}
              />

              <LoginActionButtons
                onOpenPrivacy={() => setShowPrivacy(true)}
                onSubmit={handleLogin}
                isLoading={isSubmitting}
              />

              <LoginFooterCopy />
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
});
