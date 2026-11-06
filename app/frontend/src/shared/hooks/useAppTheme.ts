import { theme, Theme } from "@/shared/styles/theme";

/**
 * Hook providing access to the centralized design system theme.
 * Adheres to SOLID (Single Responsibility) and DRY principles.
 */
export function useAppTheme(): Theme {
  return theme;
}
