import { theme } from "@/shared/styles/theme";

/**
 * Re-export theme fonts for backward compatibility and DRY architecture.
 * Central source of truth is `theme.fonts` in `@/shared/styles/theme`.
 */
export const AppFonts = theme.fonts;
export type AppFontType = typeof AppFonts;
