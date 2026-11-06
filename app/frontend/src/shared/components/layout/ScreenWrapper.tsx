import React from "react";
import {
  StatusBar,
  StatusBarStyle,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import {
  SafeAreaView,
  SafeAreaViewProps,
} from "react-native-safe-area-context";
import { Spinner } from "../feedback/Spinner";
import { Typography } from "../ui/Typography";

export interface ScreenWrapperProps extends SafeAreaViewProps {
  isLoading?: boolean;
  error?: string | null;
  statusBarStyle?: StatusBarStyle;
  statusBarColor?: string;
  containerStyle?: ViewStyle;
  children: React.ReactNode;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  isLoading = false,
  error = null,
  statusBarStyle = "dark-content",
  statusBarColor = "#FFFFFF",
  containerStyle,
  style,
  children,
  ...rest
}) => {
  return (
    <SafeAreaView style={[styles.safeArea, style]} {...rest}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={statusBarColor} />
      <View style={[styles.container, containerStyle]}>
        {isLoading ? (
          <Spinner fullScreen />
        ) : error ? (
          <View style={styles.center}>
            <Typography variant="h3" color="#FF3B30">
              Error
            </Typography>
            <Typography variant="body" color="#8E8E93" style={styles.errorText}>
              {error}
            </Typography>
          </View>
        ) : (
          children
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    marginTop: 8,
    textAlign: "center",
  },
});
