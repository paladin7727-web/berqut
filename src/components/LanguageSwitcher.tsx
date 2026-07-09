"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, localeNames } from "@/i18n/routing";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      aria-label="Language"
      value={locale}
      onChange={(e) => router.replace(pathname, { locale: e.target.value })}
      className="bg-transparent border border-accent/40 text-accent text-xs uppercase tracking-[0.15em] px-3 py-1.5 rounded-full cursor-pointer hover:border-accent/80 transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus:border-accent"
    >
      {routing.locales.map((l) => (
        <option key={l} value={l} className="bg-black tracking-normal">
          {localeNames[l]}
        </option>
      ))}
    </select>
  );
}
