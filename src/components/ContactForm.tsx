"use client";

import { useTranslations } from "next-intl";

const inputClasses =
  "w-full bg-white/[0.03] border border-white/12 rounded-lg px-4 py-3.5 text-foreground placeholder:text-white/30 focus:outline-none focus:border-accent/70 focus:ring-1 focus:ring-accent/40 focus:bg-white/[0.05] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

const labelClasses =
  "block text-[0.7rem] uppercase tracking-[0.2em] text-muted mb-3";

export default function ContactForm() {
  const t = useTranslations("contact");

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="grid sm:grid-cols-2 gap-x-6 gap-y-8"
    >
      <div>
        <label htmlFor="contact-name" className={labelClasses}>
          {t("formName")}
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="contact-email" className={labelClasses}>
          {t("formEmail")}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="contact-phone" className={labelClasses}>
          {t("formPhone")}
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="contact-type" className={labelClasses}>
          {t("formType")}
        </label>
        <select
          id="contact-type"
          name="clientType"
          defaultValue=""
          className={`${inputClasses} appearance-none`}
        >
          <option value="" disabled className="bg-black text-white/40">
            {t("formType")}
          </option>
          <option value="investor" className="bg-black">
            {t("formTypeInvestor")}
          </option>
          <option value="family" className="bg-black">
            {t("formTypeFamily")}
          </option>
          <option value="entrepreneur" className="bg-black">
            {t("formTypeEntrepreneur")}
          </option>
        </select>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="contact-message" className={labelClasses}>
          {t("formMessage")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          className={`${inputClasses} resize-none`}
        />
      </div>

      <div className="sm:col-span-2 flex flex-col items-start gap-6 mt-2">
        <button
          type="submit"
          className="btn-gold font-medium uppercase tracking-[0.2em] text-sm px-10 py-4 rounded-lg cursor-pointer"
        >
          {t("formSubmit")}
        </button>
        <p className="text-muted/80 text-xs leading-relaxed">
          {t("privacy")}
        </p>
      </div>
    </form>
  );
}
