import { theme } from "@/shared/styles/theme";
import { Component, ErrorInfo, ReactNode } from "react";
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
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || "An unexpected error occurred."}
          </Text>
          <Button
            label="Try Again"
            onPress={this.handleReset}
            style={styles.button}
          />
        </View>
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
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  message: {
    fontSize: theme.fontSizes.sm,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    minWidth: 140,
  },
});
