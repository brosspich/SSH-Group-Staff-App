import { AppColors } from "@/constants/appcolors";

export const theme = {
  colors: {
    primary: AppColors.primary || "#007AFF",
    secondary: AppColors.secondary || "#5856D6",
    background: AppColors.background || "#F2F2F7",
    surface: "#FFFFFF",
    text: "#1C1C1E",
    textSecondary: "#8E8E93",
    border: "#E5E5EA",
    error: "#FF3B30",
    success: "#34C759",
    warning: "#FF9500",
    info: "#5AC8FA",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },
  typography: {
    fontFamily: {
      regular: "System",
      bold: "System",
    },
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 22,
      xxl: 28,
    },
  },
} as const;

export type Theme = typeof theme;
