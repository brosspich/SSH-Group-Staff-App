import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../ui/Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const DefaultErrorFallback: React.FC<{
  error: Error | null;
  onReset: () => void;
}> = ({ error, onReset }) => {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("common.somethingWentWrong")}</Text>
      <Text style={styles.message}>
        {error?.message || t("common.unexpectedError")}
      </Text>
      <Button
        label={t("common.tryAgain")}
        onPress={onReset}
        style={styles.button}
      />
    </View>
  );
};

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    // fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  message: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  button: {
    minWidth: 140,
  },
});
