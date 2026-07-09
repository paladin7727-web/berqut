import { useTranslations } from "next-intl";

// Real contact details are the same across all locales, only the labels
// around them are translated.
const PHONE_GERMANY = "+49 152 09333151";
const PHONE_KAZAKHSTAN = "+7 707 299 9190";
const EMAIL = "Roberts@berqut.com";
const WEBSITE_LABEL = "BERQUT.COM";
const WEBSITE_URL = "https://berqut.com";

const eyebrowClasses =
  "text-[0.7rem] uppercase tracking-[0.25em] text-accent mb-3";
const linkClasses = "link-underline text-foreground/70 hover:text-foreground";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="relative z-10 px-6 md:px-10 pt-20 pb-14 text-muted text-sm">
      <div className="max-w-6xl mx-auto">
        <hr className="gold-rule mb-16" />

        <div className="grid gap-12 sm:grid-cols-3 text-center sm:text-left">
          <div>
            <p className={eyebrowClasses}>{t("phoneGermany")}</p>
            <a
              href={`tel:${PHONE_GERMANY.replace(/\s/g, "")}`}
              className={linkClasses}
            >
              {PHONE_GERMANY}
            </a>
            <p className={`${eyebrowClasses} mt-6`}>{t("phoneKazakhstan")}</p>
            <a
              href={`tel:${PHONE_KAZAKHSTAN.replace(/\s/g, "")}`}
              className={linkClasses}
            >
              {PHONE_KAZAKHSTAN}
            </a>
          </div>

          <div>
            <p className={eyebrowClasses}>{t("emailLabel")}</p>
            <a href={`mailto:${EMAIL}`} className={linkClasses}>
              {EMAIL}
            </a>
            <p className={`${eyebrowClasses} mt-6`}>{t("websiteLabel")}</p>
            <a
              href={WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClasses}
            >
              {WEBSITE_LABEL}
            </a>
          </div>

          <div>
            <p className="font-serif text-lg text-gold mb-3">
              {t("legalEntity")}
            </p>
            <p>{t("address")}</p>
          </div>
        </div>

        <p className="text-center text-muted/50 text-xs tracking-wide mt-16">
          {t("rights")}
        </p>
      </div>
    </footer>
  );
}
