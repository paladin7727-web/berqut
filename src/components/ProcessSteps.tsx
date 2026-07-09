"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * FIND → VERIFY → DEAL → GROW as an interactive sequence. Hovering or clicking
 * a step selects it and reveals its detail below. State-driven (no animation
 * loop); keyboard-accessible via real buttons.
 */
export default function ProcessSteps() {
  const t = useTranslations("realEstate");
  const steps = t.raw("process") as string[];
  const details = t.raw("processDetails") as string[];
  const [active, setActive] = useState(0);

  return (
    <div data-process>
      <ol className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {steps.map((step, i) => (
          <li key={step}>
            <button
              type="button"
              data-step={i}
              data-active={active === i}
              aria-pressed={active === i}
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className="group w-full text-left cursor-pointer focus:outline-none"
            >
              <span
                className={`font-serif text-3xl md:text-4xl transition-opacity duration-500 ${
                  active === i ? "text-gold opacity-100" : "text-muted opacity-50"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={`block mt-3 text-sm uppercase tracking-[0.25em] transition-colors duration-500 ${
                  active === i ? "text-foreground" : "text-muted/60"
                }`}
              >
                {step}
              </span>
              <span
                className="mt-4 block h-px w-full origin-left transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  background:
                    "linear-gradient(90deg, #ecdcb0, #c9a34e, #8a6d3b)",
                  transform: active === i ? "scaleX(1)" : "scaleX(0.25)",
                  opacity: active === i ? 1 : 0.3,
                }}
              />
            </button>
          </li>
        ))}
      </ol>

      <div
        key={active}
        data-process-detail
        className="mt-10 max-w-2xl text-lg text-muted leading-relaxed"
      >
        {details[active]}
      </div>
    </div>
  );
}
