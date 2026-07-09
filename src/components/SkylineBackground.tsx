"use client";

import { useEffect, useRef } from "react";

/**
 * Fixed golden line-art of Astana's skyline (Bayterek Tower + Khan Shatyr +
 * distant towers), split into three parallax depth layers.
 *
 * Interaction is driven purely by CSS custom properties — pointer position
 * sets --mx/--my, scroll sets --sky — and the layers' transforms are computed
 * in CSS with `transition` smoothing. No JS animation loop runs, so this is
 * cheap for Core Web Vitals. Respects prefers-reduced-motion (stays static).
 */
export default function SkylineBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onMove = (e: PointerEvent) => {
      el.style.setProperty("--mx", (e.clientX / window.innerWidth - 0.5).toFixed(4));
      el.style.setProperty("--my", (e.clientY / window.innerHeight - 0.5).toFixed(4));
    };
    const onScroll = () => {
      el.style.setProperty("--sky", String(window.scrollY));
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={ref} className="skyline" aria-hidden data-skyline>
      <svg
        viewBox="0 0 1440 1024"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
        stroke="#c9a34e"
        strokeWidth={1.2}
        vectorEffect="non-scaling-stroke"
      >
        {/* Far layer — distant towers */}
        <g className="sky-far" opacity={0.4} vectorEffect="non-scaling-stroke">
          <rect x="60" y="820" width="46" height="204" />
          <rect x="120" y="770" width="34" height="254" />
          <rect x="168" y="840" width="40" height="184" />
          <rect x="1180" y="800" width="44" height="224" />
          <rect x="1236" y="742" width="32" height="282" />
          <rect x="1282" y="820" width="52" height="204" />
          <rect x="1348" y="784" width="30" height="240" />
          <line x1="132" y1="770" x2="132" y2="740" />
          <line x1="1252" y1="742" x2="1252" y2="708" />
        </g>

        {/* Mid layer — Khan Shatyr (leaning tent) */}
        <g className="sky-mid" opacity={0.55} vectorEffect="non-scaling-stroke">
          <path d="M250 1024 Q372 452 494 1024" />
          <line x1="372" y1="470" x2="372" y2="420" />
          <line x1="372" y1="470" x2="276" y2="1024" />
          <line x1="372" y1="470" x2="324" y2="1024" />
          <line x1="372" y1="470" x2="420" y2="1024" />
          <line x1="372" y1="470" x2="468" y2="1024" />
          <path d="M300 800 Q372 690 444 800" opacity={0.7} />
        </g>

        {/* Near layer — Bayterek Tower */}
        <g className="sky-near" opacity={0.7} vectorEffect="non-scaling-stroke">
          <path d="M690 1024 C690 720 706 560 716 486" />
          <path d="M770 1024 C770 720 754 560 744 486" />
          <line x1="700" y1="900" x2="760" y2="900" />
          <line x1="702" y1="800" x2="758" y2="800" />
          <line x1="706" y1="700" x2="754" y2="700" />
          <line x1="710" y1="610" x2="750" y2="610" />
          {/* cup holding the sphere */}
          <path d="M712 486 Q730 470 748 486" />
          {/* golden sphere */}
          <circle cx="730" cy="452" r="34" />
          {/* spire */}
          <line x1="730" y1="418" x2="730" y2="392" />
        </g>
      </svg>
    </div>
  );
}
