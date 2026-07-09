import type { Locale } from "@/i18n/routing";
import { SITE_NAME, SITE_URL, localePath } from "./seo";

/**
 * RealEstateAgent + LocalBusiness structured data for BERQUT GROUP.
 *
 * Only facts confirmed in the company brief are included (legal entity,
 * city/country, languages, founding date). No phone number, street address
 * or review data is fabricated — add those fields once the real values are
 * available rather than inventing placeholders.
 */
export function buildOrganizationSchema(locale: Locale) {
  const url = localePath(locale);
  const logo = `${SITE_URL}/images/logo.jpeg`;

  return {
    "@context": "https://schema.org",
    "@type": ["RealEstateAgent", "LocalBusiness"],
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: 'LLP "BERQUT GROUP"',
    alternateName: "BERQUT Real Estate & Living International",
    url,
    logo,
    image: logo,
    description:
      "Premium real estate brokerage, construction and relocation services in Astana, Kazakhstan.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Astana",
      addressCountry: "KZ",
    },
    areaServed: {
      "@type": "City",
      name: "Astana",
    },
    knowsLanguage: ["ru", "kk", "en", "de", "zh", "es", "it"],
    founder: {
      "@type": "Person",
      name: "Robert Sowa",
    },
    inLanguage: locale,
  };
}
