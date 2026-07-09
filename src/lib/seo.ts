import { routing, type Locale } from "@/i18n/routing";

// BERQUT.COM is the primary domain (see AGENTS.md domain architecture:
// secondary domains BERQUTGROUP.COM / BERQUT-GROUP.COM 301-redirect here).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://berqut.com"
).replace(/\/$/, "");

export const SITE_NAME = "BERQUT GROUP";

// hreflang codes for each app locale. Kept as plain language codes (no
// region subtag) since the site targets each language globally, not a
// single country per language.
export const hreflangByLocale: Record<Locale, string> = {
  ru: "ru",
  kk: "kk",
  en: "en",
  de: "de",
  zh: "zh",
  es: "es",
  it: "it",
};

export function localePath(locale: Locale, path = "/"): string {
  return `${SITE_URL}/${locale}${path === "/" ? "" : path}`;
}

// Absolute URL for every locale of a given path, keyed by hreflang code,
// plus x-default pointing at the default locale. Feeds both
// generateMetadata's alternates.languages and the sitemap.
export function languageAlternates(path = "/"): Record<string, string> {
  const entries = routing.locales.map((locale) => [
    hreflangByLocale[locale],
    localePath(locale, path),
  ]);
  return {
    ...Object.fromEntries(entries),
    "x-default": localePath(routing.defaultLocale, path),
  };
}
