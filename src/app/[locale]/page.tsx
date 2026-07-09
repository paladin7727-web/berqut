"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Intro from "@/components/Intro";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import TiltCard from "@/components/TiltCard";
import ProcessSteps from "@/components/ProcessSteps";

const INTRO_SESSION_KEY = "berqut-intro-shown";

function Divider() {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10">
      <hr className="gold-rule" />
    </div>
  );
}

export default function HomePage() {
  const t = useTranslations();
  // Starts false to match the static SSR markup, then syncs from sessionStorage
  // once mounted on the client (avoids a hydration mismatch).
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(INTRO_SESSION_KEY)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowIntro(true);
    }
  }, []);

  const handleEnter = () => {
    sessionStorage.setItem(INTRO_SESSION_KEY, "1");
    setShowIntro(false);
  };

  return (
    <>
      {showIntro && <Intro onEnter={handleEnter} />}

      <header className="sticky top-0 z-30 flex items-center justify-between px-6 md:px-10 py-5 backdrop-blur-md bg-black/30 border-b border-white/[0.06]">
        <span className="font-serif text-xl tracking-[0.3em] text-gold">
          BERQUT
        </span>
        <LanguageSwitcher />
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero */}
        <section className="min-h-[88vh] flex flex-col items-center justify-center text-center px-6">
          <p className="eyebrow mb-8">BERQUT GROUP</p>
          <h1 className="font-serif text-gold text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.08] max-w-4xl">
            {t("hero.tagline")}
          </h1>
          <div className="mt-12 h-16 w-px bg-gradient-to-b from-[#c9a34e]/60 to-transparent" />
        </section>

        <Divider />

        {/* About */}
        <section id="about" className="px-6 md:px-10 py-28 md:py-40">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <p className="eyebrow mb-6">{t("nav.about")}</p>
              <h2 className="font-serif text-gold text-4xl md:text-6xl leading-[1.1] mb-10">
                {t("about.title")}
              </h2>
              <p className="text-lg md:text-xl text-muted leading-loose max-w-3xl">
                {t("about.description")}
              </p>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8 mt-16">
              {(["onePoint", "highClass", "kazakhstan"] as const).map(
                (key, i) => (
                  <Reveal key={key} delay={i * 0.12} className="h-full">
                    <TiltCard
                      maxTilt={14}
                      className="glow-surface rounded-xl p-8 bg-white/[0.02]"
                    >
                      <h3 className="font-serif text-2xl text-gold mb-4">
                        {t(`about.pillars.${key}.title`)}
                      </h3>
                      <p className="text-muted leading-relaxed">
                        {t(`about.pillars.${key}.description`)}
                      </p>
                    </TiltCard>
                  </Reveal>
                )
              )}
            </div>
          </div>
        </section>

        <Divider />

        {/* Real Estate */}
        <section id="real-estate" className="px-6 md:px-10 py-28 md:py-40">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <p className="eyebrow mb-6">{t("nav.realEstate")}</p>
              <h2 className="font-serif text-gold text-4xl md:text-6xl leading-[1.1] mb-10">
                {t("realEstate.title")}
              </h2>
              <TiltCard
                maxTilt={6}
                className="glow-surface rounded-2xl p-8 md:p-10 bg-white/[0.02] max-w-3xl"
              >
                <p className="text-lg md:text-xl text-muted leading-loose">
                  {t("realEstate.description")}
                </p>
              </TiltCard>
            </Reveal>

            {/* Interactive FIND → VERIFY → DEAL → GROW */}
            <Reveal delay={0.1}>
              <div className="mt-16">
                <ProcessSteps />
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <a href="#contact" className="link-underline inline-block mt-14 text-gold text-sm uppercase tracking-[0.25em]">
                {t("realEstate.cta")}
              </a>
            </Reveal>
          </div>
        </section>

        <Divider />

        {/* Construction */}
        <section id="construction" className="px-6 md:px-10 py-28 md:py-40">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <p className="eyebrow mb-6">{t("nav.construction")}</p>
              <h2 className="font-serif text-gold text-4xl md:text-6xl leading-[1.1] mb-10">
                {t("construction.title")}
              </h2>
              <TiltCard
                maxTilt={6}
                className="glow-surface rounded-2xl p-8 md:p-10 bg-white/[0.02] max-w-3xl"
              >
                <p className="text-lg md:text-xl text-muted leading-loose">
                  {t("construction.description")}
                </p>
              </TiltCard>
              <a href="#contact" className="link-underline inline-block mt-12 text-gold text-sm uppercase tracking-[0.25em]">
                {t("construction.cta")}
              </a>
            </Reveal>
          </div>
        </section>

        <Divider />

        {/* Relocation */}
        <section id="relocation" className="px-6 md:px-10 py-28 md:py-40">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <p className="eyebrow mb-6">{t("nav.relocation")}</p>
              <h2 className="font-serif text-gold text-4xl md:text-6xl leading-[1.1] mb-10">
                {t("relocation.title")}
              </h2>
              <TiltCard
                maxTilt={6}
                className="glow-surface rounded-2xl p-8 md:p-10 bg-white/[0.02] max-w-3xl"
              >
                <p className="text-lg md:text-xl text-muted leading-loose">
                  {t("relocation.description")}
                </p>
                <p className="mt-8 text-sm uppercase tracking-[0.2em] text-foreground/70">
                  {t("relocation.languages")}
                </p>
              </TiltCard>
              <a href="#contact" className="link-underline inline-block mt-12 text-gold text-sm uppercase tracking-[0.25em]">
                {t("relocation.cta")}
              </a>
            </Reveal>
          </div>
        </section>

        <Divider />

        {/* Founder */}
        <section id="founder" className="px-6 md:px-10 py-28 md:py-40">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <p className="eyebrow mb-6">{t("nav.founder")}</p>
              <h2 className="font-serif text-gold text-4xl md:text-6xl leading-[1.1] mb-14">
                {t("founder.title")}
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-[minmax(0,340px)_1fr] gap-12 md:gap-16 items-start">
              <Reveal>
                <figure className="mx-auto md:mx-0 w-full max-w-xs md:max-w-none">
                  <div className="card-glow relative aspect-square overflow-hidden rounded-xl">
                    <Image
                      src="/images/robert-sowa.jpeg"
                      alt={t("founder.name")}
                      fill
                      sizes="(min-width: 768px) 340px, 80vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mt-6 text-center md:text-left">
                    <p className="font-serif text-2xl text-gold">
                      {t("founder.name")}
                    </p>
                    <p className="mt-1 text-sm uppercase tracking-[0.2em] text-muted">
                      {t("founder.role")}
                    </p>
                  </figcaption>
                </figure>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="text-lg text-muted leading-loose">
                  {t("founder.bio")}
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        <Divider />

        {/* Contact */}
        <section id="contact" className="px-6 md:px-10 py-28 md:py-40">
          <div className="max-w-2xl mx-auto">
            <Reveal>
              <p className="eyebrow mb-6">{t("nav.contact")}</p>
              <h2 className="font-serif text-gold text-4xl md:text-6xl leading-[1.1] mb-12">
                {t("contact.title")}
              </h2>
              <ContactForm />
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
