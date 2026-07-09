"use client";

import { useEffect, useRef } from "react";

/**
 * Soft gold light that follows the cursor. Positioned in the handler directly
 * (transform), with CSS transition providing the trailing smoothness — no JS
 * animation loop. Only enabled for fine-pointer, hover-capable, non-reduced-
 * motion devices; renders nothing meaningful otherwise.
 */
export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fineHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduce || !fineHover) return;

    const onMove = (e: PointerEvent) => {
      el.style.opacity = "1";
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <div ref={ref} className="cursor-glow" aria-hidden data-cursor-glow />;
}
