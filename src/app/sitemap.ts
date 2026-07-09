import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { localePath, languageAlternates } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const alternates = languageAlternates("/");

  return routing.locales.map((locale) => ({
    url: localePath(locale),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: locale === routing.defaultLocale ? 1 : 0.8,
    alternates: { languages: alternates },
  }));
}
