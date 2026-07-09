"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { generateReply, type ChatIntent } from "@/lib/chatbot";

type Message = { role: "user" | "bot"; text: string };

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

// Suggestion chips map directly to an intent so they always route correctly,
// regardless of language.
const SUGGESTIONS: { key: string; intent: ChatIntent }[] = [
  { key: "services", intent: "services" },
  { key: "founder", intent: "founder" },
  { key: "contact", intent: "contact" },
];

export default function Chatbot() {
  const t = useTranslations();
  const locale = useLocale();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset the conversation when the site language changes, so the greeting and
  // answers always match the language the visitor is browsing in.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages([]);
  }, [locale]);

  // Seed the greeting the first time the panel is opened (or re-opened after a
  // language switch cleared the thread).
  useEffect(() => {
    if (open && messages.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages([{ role: "bot", text: t("chat.greeting") }]);
    }
  }, [open, messages.length, t]);

  // Keep the newest message in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  // Focus the input when the panel opens; close on Escape.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(text: string, forcedIntent?: ChatIntent) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setTyping(true);
    const reply = await generateReply(trimmed, t, forcedIntent);
    setTyping(false);
    setMessages((m) => [...m, { role: "bot", text: reply }]);
  }

  const showSuggestions = messages.length <= 1 && !typing;

  return (
    <>
      {/* Floating launcher */}
      <button
        onClick={() => setOpen(true)}
        aria-label={t("chat.open")}
        className="btn-gold fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
        style={{
          opacity: open ? 0 : 1,
          transform: open ? "scale(0.8)" : "scale(1)",
          pointerEvents: open ? "none" : "auto",
          transition: `opacity 0.35s ${EASE}, transform 0.35s ${EASE}`,
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-.9-3.8A8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" />
        </svg>
      </button>

      {/* Chat panel */}
      <section
        role="dialog"
        aria-modal="false"
        aria-label={t("chat.title")}
        aria-hidden={!open}
        className="glow-surface fixed bottom-6 right-6 z-40 flex w-[calc(100vw-3rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-[#c9a34e]/25 bg-[#0b0a08]/95 backdrop-blur-xl"
        style={{
          height: "min(70vh, 560px)",
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0) scale(1)" : "translateY(16px) scale(0.96)",
          transformOrigin: "bottom right",
          pointerEvents: open ? "auto" : "none",
          transition: `opacity 0.4s ${EASE}, transform 0.4s ${EASE}`,
        }}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="font-serif text-gold text-lg leading-tight">
              {t("chat.title")}
            </p>
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted/70">
              {t("chat.disclaimer")}
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label={t("chat.close")}
            className="text-muted transition-colors duration-300 hover:text-[#c9a34e]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
          aria-live="polite"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={
                  m.role === "user"
                    ? "max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-sm bg-[#c9a34e]/15 px-4 py-2.5 text-sm text-foreground"
                    : "max-w-[90%] whitespace-pre-line rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-foreground/90"
                }
              >
                {m.text}
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex justify-start" aria-label={t("chat.typing")}>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.03] px-4 py-3">
                <span className="chat-dot" />
                <span className="chat-dot" style={{ animationDelay: "0.15s" }} />
                <span className="chat-dot" style={{ animationDelay: "0.3s" }} />
              </div>
            </div>
          )}

          {showSuggestions && (
            <div className="flex flex-wrap gap-2 pt-1">
              {SUGGESTIONS.map(({ key, intent }) => (
                <button
                  key={key}
                  onClick={() => send(t(`chat.suggestions.${key}`), intent)}
                  className="rounded-full border border-[#c9a34e]/40 px-3 py-1.5 text-xs text-[#c9a34e] transition-colors duration-300 hover:border-[#c9a34e] hover:bg-[#c9a34e]/10"
                >
                  {t(`chat.suggestions.${key}`)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-white/10 px-4 py-3"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("chat.placeholder")}
            aria-label={t("chat.placeholder")}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-white/30 focus:outline-none"
          />
          <button
            type="submit"
            aria-label={t("chat.send")}
            disabled={!input.trim() || typing}
            className="btn-gold flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-40"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </form>
      </section>
    </>
  );
}
