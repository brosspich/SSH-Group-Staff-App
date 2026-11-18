import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./locales/en";
import { fr } from "./locales/fr";
import { km } from "./locales/km";
import { zh } from "./locales/zh";

export const LANGUAGE_STORAGE_KEY = "app_user_language";

export type SupportedLanguage = "en" | "km" | "zh" | "fr";

export const resources = {
  en: { translation: en },
  km: { translation: km },
  zh: { translation: zh },
  fr: { translation: fr },
} as const;

// Default initialization
i18n.use(initReactI18next).init({
  compatibilityJSON: "v4" as any,
  resources,
  lng: "en", // Default to English
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
} as any);

/**
 * Hydrates language selection from local storage
 */
export async function initLanguageFromStorage(): Promise<SupportedLanguage> {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved) {
      const lower = saved.toLowerCase();
      const normalized: SupportedLanguage = lower.startsWith("zh")
        ? "zh"
        : lower.startsWith("km")
          ? "km"
          : lower.startsWith("fr")
            ? "fr"
            : "en";
      await i18n.changeLanguage(normalized);
      return normalized;
    }
  } catch (err) {
    console.warn("[i18n] Failed to load saved language:", err);
  }
  return "en";
}

/**
 * Changes active language and persists choice to storage
 */
export async function setAppLanguage(lang: SupportedLanguage): Promise<void> {
  try {
    const lower = lang.toLowerCase();
    const normalized: SupportedLanguage = lower.startsWith("zh")
      ? "zh"
      : lower.startsWith("km")
        ? "km"
        : lower.startsWith("fr")
          ? "fr"
          : "en";
    await i18n.changeLanguage(normalized);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
  } catch (err) {
    console.warn("[i18n] Failed to save language:", err);
  }
}

/**
 * Returns currently active language code ("en" | "km" | "zh" | "fr")
 */
export function getAppLanguage(): SupportedLanguage {
  const raw = (i18n.resolvedLanguage || i18n.language || "en").toLowerCase();
  if (raw.startsWith("zh")) return "zh";
  if (raw.startsWith("km")) return "km";
  if (raw.startsWith("fr")) return "fr";
  return "en";
}

// Auto hydrate on module load
initLanguageFromStorage().catch(() => null);

export default i18n;
