"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

/**
 * Full-screen branded intro.
 *
 * The source video is a self-contained 15s narrative (golden eagle emblem →
 * aerial Astana at golden hour → logo lockup). It plays through once and rests
 * on its final frame, at which point the BERQUT logo fades in as the clickable
 * trigger into the main site.
 *
 * Delivery is optimised for Core Web Vitals: the poster paints instantly, the
 * video is mounted only after first paint (lazy), and constrained clients
 * (reduced-motion / save-data) never download the video — they get a static
 * branded screen instead. All transitions are plain CSS (no animation
 * library) — see the inline `transition` styles below.
 */

type Mode = "video" | "static";

// Minimal shape of the (non-standard) Network Information API we rely on.
type NetworkInformation = {
  saveData?: boolean;
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Only `saveData` is treated as a hard signal. `effectiveType` is a rough,
// often-wrong heuristic (misreports "3g" on fine connections, especially
// over VPN/RDP or right after page load) — trusting it caused the video to
// wrongly fall back to static for users with normal connections.
function isConstrainedConnection(): boolean {
  if (typeof navigator === "undefined") return false;
  const conn = (
    navigator as Navigator & { connection?: NetworkInformation }
  ).connection;
  if (!conn) return false;
  return Boolean(conn.saveData);
}

// Approximations of the GSAP eases this component used to run, so the CSS
// transitions below play back visually identically.
const EASE_POWER2_OUT = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
const EASE_POWER2_INOUT = "cubic-bezier(0.455, 0.03, 0.515, 0.955)";

export default function Intro({ onEnter }: { onEnter: () => void }) {
  const t = useTranslations("intro");

  const videoRef = useRef<HTMLVideoElement>(null);

  // Resolved on the client after mount so SSR markup is deterministic.
  const [mode, setMode] = useState<Mode | null>(null);
  // Gate the <video> mount to after first paint so the poster is the LCP,
  // not the video download.
  const [videoMounted, setVideoMounted] = useState(false);
  // Set once the video has played through (or bailed out).
  const [videoDone, setVideoDone] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  // Drives the container's fade-in once mode is resolved.
  const [containerVisible, setContainerVisible] = useState(false);
  // Drives the container's fade-out when the user enters the site.
  const [exiting, setExiting] = useState(false);

  // The logo becomes the clickable trigger once the intro is at rest: either
  // there's no video (static mode) or the video has finished / failed.
  const logoReady = mode === "static" || videoDone;

  const enter = useCallback(() => {
    setExiting(true);
    // Matches the transition duration below — no onComplete callback needed.
    setTimeout(onEnter, 600);
  }, [onEnter]);

  // Decide the mode once, on the client. This syncs React with the runtime
  // environment (media query + network info), so it must run post-mount to
  // keep SSR markup deterministic.
  useEffect(() => {
    const constrained = prefersReducedMotion() || isConstrainedConnection();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(constrained ? "static" : "video");
  }, []);

  useEffect(() => {
    if (!mode) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContainerVisible(true);

    const skipTimer = setTimeout(() => setShowSkip(true), 800);

    if (mode === "video") {
      // Lazy-load: mount the <video> after first paint so the poster paints first.
      const mountTimer = setTimeout(() => setVideoMounted(true), 50);
      return () => {
        clearTimeout(skipTimer);
        clearTimeout(mountTimer);
      };
    }

    // Static mode: logoReady is already derived true, nothing to schedule.
    return () => clearTimeout(skipTimer);
  }, [mode]);

  const handleVideoEnded = useCallback(() => {
    // Hold on the final frame and hand over to the logo trigger.
    setVideoDone(true);
  }, []);

  const handleVideoError = useCallback(() => {
    // If the video can't load/decode, fall back to the static branded screen.
    setMode("static");
    setVideoDone(true);
  }, []);

  // Autoplay may be blocked; if so, surface the logo trigger so nobody is stuck.
  const handleCanPlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    if (p) {
      p.catch(() => setVideoDone(true));
    }
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
      style={{
        opacity: containerVisible && !exiting ? 1 : 0,
        transition: exiting
          ? `opacity 0.6s ${EASE_POWER2_INOUT}`
          : `opacity 1s ${EASE_POWER2_OUT}`,
      }}
    >
      {mode === "video" && videoMounted && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          autoPlay
          playsInline
          preload="auto"
          poster="/videos/poster.jpg"
          onEnded={handleVideoEnded}
          onError={handleVideoError}
          onCanPlay={handleCanPlay}
        >
          <source src="/videos/intro.webm" type="video/webm" />
          <source src="/videos/intro.mp4" type="video/mp4" />
        </video>
      )}

      {/* Poster paints instantly before the video mounts (and is the static
          branded screen's backdrop in constrained mode). */}
      {(mode === null || (mode === "video" && !videoMounted)) && (
        <div
          aria-hidden
          className="absolute inset-0 bg-black bg-center bg-cover"
          style={{ backgroundImage: "url(/videos/poster.jpg)" }}
        />
      )}

      {/* Clickable BERQUT logo — the trigger into the site. */}
      <button
        onClick={enter}
        aria-label="BERQUT GROUP — enter site"
        className="relative z-10 cursor-pointer select-none disabled:cursor-default"
        disabled={!logoReady}
        style={{
          pointerEvents: logoReady ? "auto" : "none",
          opacity: logoReady ? 1 : 0,
          transform: logoReady ? "scale(1)" : "scale(0.96)",
          transition: `opacity 1.2s ${EASE_POWER2_OUT}, transform 1.2s ${EASE_POWER2_OUT}`,
        }}
      >
        <Image
          src="/images/logo.jpeg"
          alt="BERQUT GROUP — Real Estate & Living International"
          width={1134}
          height={661}
          priority={mode === "static"}
          sizes="(min-width: 700px) 560px, 80vw"
          className="w-[min(80vw,560px)] h-auto"
        />
      </button>

      {showSkip && (
        <button
          onClick={enter}
          className="absolute bottom-8 right-8 z-20 text-sm text-[#b8925a] border border-[#b8925a] px-4 py-2 rounded hover:bg-[#b8925a] hover:text-black transition-colors"
        >
          {t("skip")}
        </button>
      )}
    </div>
  );
}
