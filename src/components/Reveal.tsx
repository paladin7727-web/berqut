"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Wraps content in a scroll-triggered fade + rise reveal.
 *
 * Elements below the fold start hidden and animate in as they enter the
 * viewport, via IntersectionObserver + a CSS transition (see `.reveal` /
 * `.reveal-visible` in globals.css) — no animation library involved.
 * Respects prefers-reduced-motion (content simply stays visible).
 */
export default function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      return;
    }

    // rootMargin brings the trigger point to roughly the same "top 85% of
    // viewport" line the previous ScrollTrigger config used.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -15% 0px" }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "reveal-visible" : ""} ${className ?? ""}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}
