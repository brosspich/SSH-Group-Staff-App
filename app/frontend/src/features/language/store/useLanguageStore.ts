import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import i18n, { LANGUAGE_STORAGE_KEY, SupportedLanguage } from "../i18n/i18n";

function normalizeLang(lang?: string | null): SupportedLanguage {
  if (!lang) return "en";
  const clean = String(lang).trim().toLowerCase();
  if (clean.startsWith("zh")) return "zh";
  if (clean.startsWith("km")) return "km";
  if (clean.startsWith("fr")) return "fr";
  return "en";
}

interface LanguageState {
  currentLang: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  initLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  currentLang: normalizeLang(i18n.resolvedLanguage || i18n.language),

  setLanguage: async (lang: SupportedLanguage) => {
    try {
      const normalized = normalizeLang(lang);
      await i18n.changeLanguage(normalized);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
      set({ currentLang: normalized });
    } catch (err) {
      console.warn("[LanguageStore] Failed to change language:", err);
    }
  },

  initLanguage: async () => {
    try {
      const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved) {
        const normalized = normalizeLang(saved);
        await i18n.changeLanguage(normalized);
        set({ currentLang: normalized });
        return;
      }
    } catch (err) {
      console.warn("[LanguageStore] Failed to init language:", err);
    }
    const fallback = normalizeLang(i18n.resolvedLanguage || i18n.language);
    set({ currentLang: fallback });
  },
}));

// Listen to i18n language changes directly as a safety fallback
i18n.on("languageChanged", (lng: string) => {
  const normalized = normalizeLang(lng);
  if (useLanguageStore.getState().currentLang !== normalized) {
    useLanguageStore.setState({ currentLang: normalized });
  }
});

// Auto initialize on module load
useLanguageStore
  .getState()
  .initLanguage()
  .catch(() => null);
