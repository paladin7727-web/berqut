"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Card that tilts in 3D toward the cursor, with a gold glare that tracks the
 * pointer. Rotation is written straight to CSS custom properties on
 * pointermove (no rAF loop); CSS handles the easing. Falls back to a plain
 * static card when reduced-motion is set or the device has no fine pointer.
 *
 * `className` styles the inner (visual) surface so the glare's border-radius
 * matches. The outer element only establishes perspective.
 */
export default function TiltCard({
  children,
  className = "",
  maxTilt = 12,
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fineHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(!reduce.matches && fineHover.matches);
    update();
    reduce.addEventListener("change", update);
    fineHover.addEventListener("change", update);
    return () => {
      reduce.removeEventListener("change", update);
      fineHover.removeEventListener("change", update);
    };
  }, []);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width; // 0..1
    const py = (e.clientY - r.top) / r.height; // 0..1
    el.style.setProperty("--rx", `${((0.5 - py) * 2 * maxTilt).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${((px - 0.5) * 2 * maxTilt).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
    el.dataset.tilting = "true";
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.dataset.tilting = "false";
  };

  return (
    <div
      ref={ref}
      className="tilt-card"
      data-tilt
      data-tilting="false"
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      <div className={`tilt-card-inner ${className}`}>
        {children}
        <span className="tilt-glare" aria-hidden />
      </div>
    </div>
  );
}
