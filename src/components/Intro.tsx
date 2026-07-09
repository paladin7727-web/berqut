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
 *
 * Audio: the video autoplays MUTED (browsers block autoplay with sound). A
 * corner toggle lets the visitor turn sound on — a real user gesture, which
 * satisfies the autoplay policy. Turning it on swaps to an audio-enabled
 * source (`intro-with-sound.mp4`, only downloaded on that interaction) at the
 * current playback position. The preference is remembered for the session.
 */

type Mode = "video" | "static";

// Minimal shape of the (non-standard) Network Information API we rely on.
type NetworkInformation = {
  saveData?: boolean;
};

const SOUND_SRC = "/videos/intro-with-sound.mp4";
const SOUND_PREF_KEY = "berqut-intro-sound";

function readSoundPref(): boolean {
  try {
    return sessionStorage.getItem(SOUND_PREF_KEY) === "on";
  } catch {
    return false;
  }
}

function persistSoundPref(on: boolean): void {
  try {
    sessionStorage.setItem(SOUND_PREF_KEY, on ? "on" : "off");
  } catch {
    /* sessionStorage unavailable — non-fatal */
  }
}

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
  // Whether we've already swapped in the audio-enabled source (only download
  // it once, and only on demand).
  const soundActivatedRef = useRef(false);

  // Resolved on the client after mount so SSR markup is deterministic.
  const [mode, setMode] = useState<Mode | null>(null);
  // Gate the <video> mount to after first paint so the poster is the LCP,
  // not the video download.
  const [videoMounted, setVideoMounted] = useState(false);
  // Set once the video has played through (or bailed out).
  const [videoDone, setVideoDone] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  // Whether audio is currently on. Always starts false (muted autoplay).
  const [soundOn, setSoundOn] = useState(false);
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

  // Swap to the audio-enabled source (once), preserving position, then unmute
  // and play. Returns true if sound is now playing.
  const enableSound = useCallback(async (): Promise<boolean> => {
    const v = videoRef.current;
    if (!v) return false;

    if (!soundActivatedRef.current) {
      soundActivatedRef.current = true;
      const resumeAt = v.currentTime;
      const wasEnded = v.ended;
      v.src = SOUND_SRC;
      v.load();
      await new Promise<void>((resolve) => {
        const done = () => {
          v.removeEventListener("loadeddata", done);
          resolve();
        };
        v.addEventListener("loadeddata", done, { once: true });
        setTimeout(done, 3000); // safety net
      });
      if (!wasEnded) {
        try {
          v.currentTime = resumeAt;
        } catch {
          /* seeking not ready — start from 0 */
        }
      }
    }

    v.muted = false;
    try {
      await v.play();
      setSoundOn(true);
      persistSoundPref(true);
      return true;
    } catch {
      // Browser blocked unmuted playback — keep playing, just muted.
      v.muted = true;
      setSoundOn(false);
      persistSoundPref(false);
      return false;
    }
  }, []);

  const toggleSound = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (soundOn) {
      v.muted = true;
      setSoundOn(false);
      persistSoundPref(false);
    } else {
      void enableSound();
    }
  }, [soundOn, enableSound]);

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
      p.then(() => {
        // If the visitor enabled sound earlier this session, try to restore it
        // (best-effort — the browser may still require a fresh gesture).
        if (readSoundPref() && !soundActivatedRef.current) {
          void enableSound();
        }
      }).catch(() => setVideoDone(true));
    }
  }, [enableSound]);

  const showSoundToggle =
    mode === "video" && videoMounted && !videoDone && showSkip;

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

      {/* Sound on/off toggle — bottom-left, mirroring the skip button. Only in
          video mode, so it never appears in the static fallback. */}
      {showSoundToggle && (
        <button
          onClick={toggleSound}
          aria-label={soundOn ? t("soundOff") : t("soundOn")}
          aria-pressed={soundOn}
          className="absolute bottom-8 left-8 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-[#b8925a] text-[#b8925a] hover:bg-[#b8925a] hover:text-black transition-colors"
        >
          {soundOn ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M11 5 6 9H2v6h4l5 4z" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M11 5 6 9H2v6h4l5 4z" />
              <path d="M23 9l-6 6" />
              <path d="M17 9l6 6" />
            </svg>
          )}
        </button>
      )}

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
