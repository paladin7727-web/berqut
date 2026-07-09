"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const inputClasses =
  "w-full bg-white/[0.03] border border-white/12 rounded-lg px-4 py-3.5 text-foreground placeholder:text-white/30 focus:outline-none focus:border-accent/70 focus:ring-1 focus:ring-accent/40 focus:bg-white/[0.05] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

const labelClasses =
  "block text-[0.7rem] uppercase tracking-[0.2em] text-muted mb-3";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const t = useTranslations("contact");
  const locale = useLocale();

  const [status, setStatus] = useState<Status>("idle");
  const [errorKey, setErrorKey] = useState<"error" | "errorValidation">("error");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale }),
      });

      if (res.ok) {
        setStatus("success");
        form.reset();
        return;
      }

      // 400 validation vs. any other server/config error → different messages.
      let payload: { error?: string } = {};
      try {
        payload = await res.json();
      } catch {
        /* non-JSON error body */
      }
      setErrorKey(payload.error === "validation" ? "errorValidation" : "error");
      setStatus("error");
    } catch {
      setErrorKey("error");
      setStatus("error");
    }
  }

  // Success replaces the form with a confirmation panel.
  if (status === "success") {
    return (
      <div
        role="status"
        className="glow-surface rounded-2xl px-8 py-12 text-center bg-white/[0.02]"
      >
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-accent/50">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#c9a34e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <p className="text-lg text-foreground/90">{t("success")}</p>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-x-6 gap-y-8" noValidate>
      {/* Honeypot — visually hidden, ignored by humans, filled by bots. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <div>
        <label htmlFor="contact-name" className={labelClasses}>
          {t("formName")}
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          disabled={submitting}
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
          required
          disabled={submitting}
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
          disabled={submitting}
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
          disabled={submitting}
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
          required
          disabled={submitting}
          className={`${inputClasses} resize-none`}
        />
      </div>

      <div className="sm:col-span-2 flex flex-col items-start gap-6 mt-2">
        <button
          type="submit"
          disabled={submitting}
          className="btn-gold font-medium uppercase tracking-[0.2em] text-sm px-10 py-4 rounded-lg cursor-pointer disabled:opacity-60 disabled:cursor-default"
        >
          {submitting ? t("sending") : t("formSubmit")}
        </button>

        {status === "error" && (
          <p role="alert" className="text-sm text-red-400/90">
            {t(errorKey)}
          </p>
        )}

        <p className="text-muted/80 text-xs leading-relaxed">{t("privacy")}</p>
      </div>
    </form>
  );
}
