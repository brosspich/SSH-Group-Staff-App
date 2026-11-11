import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./locales/en";
import { km } from "./locales/km";

export const LANGUAGE_STORAGE_KEY = "app_user_language";

export type SupportedLanguage = "en" | "km";

export const resources = {
  en: { translation: en },
  km: { translation: km },
} as const;

// Default initialization
i18n.use(initReactI18next).init({
  compatibilityJSON: "v4" as any,
  resources,
  lng: "km", // Default to Khmer
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
      const normalized: SupportedLanguage = saved.toLowerCase().startsWith("en")
        ? "en"
        : "km";
      await i18n.changeLanguage(normalized);
      return normalized;
    }
  } catch (err) {
    console.warn("[i18n] Failed to load saved language:", err);
  }
  return "km";
}

/**
 * Changes active language and persists choice to storage
 */
export async function setAppLanguage(lang: SupportedLanguage): Promise<void> {
  try {
    const normalized: SupportedLanguage = lang.toLowerCase().startsWith("en")
      ? "en"
      : "km";
    await i18n.changeLanguage(normalized);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
  } catch (err) {
    console.warn("[i18n] Failed to save language:", err);
  }
}

/**
 * Returns currently active language code ("en" | "km")
 */
export function getAppLanguage(): SupportedLanguage {
  const raw = (i18n.resolvedLanguage || i18n.language || "km").toLowerCase();
  return raw.startsWith("en") ? "en" : "km";
}

// Auto hydrate on module load
initLanguageFromStorage().catch(() => null);

export default i18n;
