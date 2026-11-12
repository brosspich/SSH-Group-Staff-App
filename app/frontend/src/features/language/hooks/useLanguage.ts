import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { SupportedLanguage } from "../i18n/i18n";
import { useLanguageStore } from "../store/useLanguageStore";

export function useLanguage() {
  const { t, i18n } = useTranslation();
  const storeLang = useLanguageStore((s) => s.currentLang);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  // Normalize current active language directly from i18n instance (authoritative source of truth for translations)
  const rawLang = (i18n.resolvedLanguage || i18n.language || storeLang || "en")
    .toString()
    .toLowerCase();
  const currentLang: SupportedLanguage = rawLang.startsWith("zh")
    ? "zh"
    : rawLang.startsWith("km")
      ? "km"
      : "en";

  const changeLanguage = useCallback(
    async (lang: SupportedLanguage) => {
      await setLanguage(lang);
    },
    [setLanguage],
  );

  return {
    t,
    i18n,
    currentLang,
    changeLanguage,
    isKhmer: currentLang === "km",
    isEnglish: currentLang === "en",
    isChinese: currentLang === "zh",
  };
}
