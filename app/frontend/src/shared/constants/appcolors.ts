import { theme } from "@/shared/styles/theme";

/**
 * Re-export theme colors for backward compatibility and DRY architecture.
 * Central source of truth is `theme.colors` in `@/shared/styles/theme`.
 */
export const AppColors = theme.colors;
export type AppColorType = typeof AppColors;
