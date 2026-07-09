import { defineRouting } from "next-intl/routing";

export const locales = ["ru", "kk", "en", "de", "zh", "es", "it"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  ru: "Русский",
  kk: "Қазақша",
  en: "English",
  de: "Deutsch",
  zh: "中文",
  es: "Español",
  it: "Italiano",
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});
