/**
 * Landing Page — öffentliche Startseite der DiveLog Studio App.
 *
 * Zeigt Hero-Bereich mit tropischem Unterwasser-Hintergrundbild,
 * Feature-Übersicht mit thematischen Bildern, Showcase-Galerie
 * und Call-to-Action-Sektion. Leitet in Teams-Kontext automatisch
 * zum Dashboard weiter.
 */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/providers/auth-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useTeams } from "@/providers/teams-provider";

type FeatureHighlight = {
  key: string;
  accentKey: string;
  titleKey: string;
  descriptionKey: string;
  href?: string;
  image: string;
};

const featureHighlights: FeatureHighlight[] = [
  {
    key: "dives",
    accentKey: "landing.features.dives.accent",
    titleKey: "landing.features.dives.title",
    descriptionKey: "landing.features.dives.description",
    href: "/dashboard/dives",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=70"
  },
  {
    key: "equipment",
    accentKey: "landing.features.equipment.accent",
    titleKey: "landing.features.equipment.title",
    descriptionKey: "landing.features.equipment.description",
    href: "/dashboard/equipment",
    image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=600&q=70"
  },
  {
    key: "members",
    accentKey: "landing.features.members.accent",
    titleKey: "landing.features.members.title",
    descriptionKey: "landing.features.members.description",
    href: "/dashboard/members",
    image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=600&q=70"
  },
  {
    key: "community",
    accentKey: "landing.features.community.accent",
    titleKey: "landing.features.community.title",
    descriptionKey: "landing.features.community.description",
    href: "/dashboard/community",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=600&q=70"
  },
  {
    key: "account",
    accentKey: "landing.features.account.accent",
    titleKey: "landing.features.account.title",
    descriptionKey: "landing.features.account.description",
    image: "https://images.unsplash.com/photo-1682687218982-6c508299e107?auto=format&fit=crop&w=600&q=70"
  },
  {
    key: "social",
    accentKey: "landing.features.social.accent",
    titleKey: "landing.features.social.title",
    descriptionKey: "landing.features.social.description",
    image: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=600&q=70"
  },
  {
    key: "workflows",
    accentKey: "landing.features.workflows.accent",
    titleKey: "landing.features.workflows.title",
    descriptionKey: "landing.features.workflows.description",
    image: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&w=600&q=70"
  }
];

export default function LandingPage() {
  const { currentUser } = useAuth();
  const { t } = useI18n();
  const teams = useTeams();
  const router = useRouter();

  // Auto-redirect to dashboard when in Teams context
  useEffect(() => {
    if (teams.isInitialized && teams.isInTeams) {
      router.push('/dashboard');
    }
  }, [teams.isInitialized, teams.isInTeams, router]);

  // Don't render landing page in Teams
  if (teams.isInTeams) {
    return null;
  }

  return (
    <>
      {/* Hero Section with Tropical Ocean Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-abyss-900 via-ocean-800 to-reef-700 transition-colors dark:from-[#051218] dark:via-[#0a2030] dark:to-[#0c2a35]">
        {/* Full-bleed underwater hero image */}
        <div className="absolute inset-0" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="h-full w-full object-cover opacity-50 dark:opacity-40"
            loading="eager"
          />
        </div>
        {/* Gradient overlays — lighter at top to show image, darker at bottom for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-abyss-900/30 via-abyss-900/50 to-abyss-900/70 dark:from-[#051218]/40 dark:via-[#0a2030]/60 dark:to-[#0c2a35]/80" aria-hidden="true"></div>
        
        {/* Animated Background Pattern — tropical reef bubbles */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 600%22><defs><pattern id=%22ocean%22 x=%220%22 y=%220%22 width=%22120%22 height=%22120%22 patternUnits=%22userSpaceOnUse%22><path d=%22M0,60 Q30,40 60,60 T120,60%22 fill=%22none%22 stroke=%22rgba(103,232,249,0.12)%22 stroke-width=%222%22/><circle cx=%2225%22 cy=%2235%22 r=%222.5%22 fill=%22rgba(103,232,249,0.15)%22/><circle cx=%2290%22 cy=%2280%22 r=%223.5%22 fill=%22rgba(110,231,183,0.1)%22/><circle cx=%2260%22 cy=%2215%22 r=%221.5%22 fill=%22rgba(253,186,116,0.12)%22/></pattern></defs><rect width=%221200%22 height=%22600%22 fill=%22url(%23ocean)%22/></svg>')] opacity-40"></div>
          
          {/* Floating Elements — tropical colors */}
          <div className="absolute top-10 left-10 w-40 h-40 bg-ocean-400 rounded-full opacity-10 blur-3xl animate-float" style={{ animationDuration: '8s' }}></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-reef-400 rounded-full opacity-10 blur-3xl animate-float" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 right-1/4 w-36 h-36 bg-coral-400 rounded-full opacity-8 blur-3xl animate-float" style={{ animationDuration: '10s', animationDelay: '4s' }}></div>
          <div className="absolute bottom-1/3 left-1/4 w-32 h-32 bg-sand-400 rounded-full opacity-5 blur-3xl animate-float" style={{ animationDuration: '14s', animationDelay: '6s' }}></div>
        </div>

        {/* Wave Divider at Bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none" aria-hidden="true">
          <svg className="relative block w-[calc(100%+1.3px)] h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,40 C150,100 350,0 600,40 C850,80 1050,0 1200,40 L1200,120 L0,120 Z" className="fill-white dark:fill-[#071620]"></path>
          </svg>
        </div>

        {/* Content */}
        <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-20 pb-28">
          <div className="flex flex-col gap-6 text-center">
            <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-ocean-300/30 bg-ocean-500/20 px-4 py-1.5 text-sm font-medium text-ocean-100 backdrop-blur-sm">
              🐠 {t("landing.hero.badge")}
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg md:text-5xl lg:text-6xl">
              {t("landing.hero.title")}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-ocean-100/90">
              {t("landing.hero.subtitle")}
            </p>
            {currentUser ? (
              <div className="flex justify-center pt-2">
                <Link
                  href="/dashboard"
                  className="rounded-full bg-gradient-to-r from-ocean-400 to-reef-400 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-ocean-500/30 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-ocean-500/40"
                >
                  {t("landing.hero.cta.explore")}
                </Link>
              </div>
            ) : (
              <>
                <div className="flex flex-col justify-center gap-3 pt-2 md:flex-row">
                  <Link
                    href="/auth/register"
                    className="rounded-full bg-gradient-to-r from-coral-500 to-coral-400 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-coral-500/30 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-coral-500/40"
                  >
                    {t("landing.hero.cta.register")}
                  </Link>
                  <Link
                    href="/auth/login"
                    className="rounded-full border-2 border-white/40 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white/20 hover:border-white/60"
                  >
                    {t("landing.hero.cta.login")}
                  </Link>
                  <Link
                    href="/dashboard/community"
                    className="rounded-full border-2 border-reef-300/40 bg-reef-500/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:bg-reef-500/20 hover:border-reef-300/60"
                  >
                    {t("landing.hero.cta.explore")}
                  </Link>
                </div>
                <p className="text-sm text-ocean-200/80">
                  {t("landing.hero.caption")}
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white transition-colors dark:bg-slate-950">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-16">
          <section className="grid gap-6 rounded-3xl border border-ocean-100 bg-gradient-to-br from-white to-ocean-50/30 p-8 shadow-sm transition-colors dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-900/60 dark:to-ocean-900/20">
          <header className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-semibold text-slate-900 transition-colors dark:text-slate-100">
              {t("landing.features.heading")}
            </h2>
            <p className="text-sm text-slate-600 transition-colors dark:text-slate-300">
              {t("landing.features.description")}
            </p>
          </header>
          <div className="grid gap-4 md:grid-cols-3">
            {featureHighlights.map((feature, index) => {
              const accentColors = [
                "border-ocean-200 bg-ocean-50 text-ocean-700 dark:border-ocean-700 dark:bg-ocean-900/40 dark:text-ocean-300",
                "border-coral-200 bg-coral-50 text-coral-700 dark:border-coral-700 dark:bg-coral-900/40 dark:text-coral-300",
                "border-reef-200 bg-reef-50 text-reef-700 dark:border-reef-700 dark:bg-reef-900/40 dark:text-reef-300",
                "border-abyss-200 bg-abyss-50 text-abyss-700 dark:border-abyss-700 dark:bg-abyss-900/40 dark:text-abyss-300",
                "border-sand-200 bg-sand-50 text-sand-700 dark:border-sand-700 dark:bg-sand-900/40 dark:text-sand-300",
                "border-ocean-200 bg-ocean-50 text-ocean-700 dark:border-ocean-700 dark:bg-ocean-900/40 dark:text-ocean-300",
                "border-reef-200 bg-reef-50 text-reef-700 dark:border-reef-700 dark:bg-reef-900/40 dark:text-reef-300"
              ];
              const Card = (
                <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition hover:-translate-y-1 hover:border-ocean-300 hover:shadow-lg hover:shadow-ocean-100/50 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-ocean-500 dark:hover:shadow-ocean-900/30">
                  <div className="relative h-36 overflow-hidden">
                    <Image
                      src={feature.image}
                      alt=""
                      width={600}
                      height={300}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent dark:from-slate-900/80"></div>
                  </div>
                  <div className="p-5">
                    <span className={`mb-3 inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${accentColors[index % accentColors.length]}`}>
                      {t(feature.accentKey)}
                    </span>
                    <h3 className="text-lg font-semibold text-slate-900 transition-colors dark:text-slate-100">
                      {t(feature.titleKey)}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 transition-colors dark:text-slate-300">
                      {t(feature.descriptionKey)}
                    </p>
                    {feature.href && (
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ocean-600 transition-colors group-hover:text-ocean-500 dark:text-ocean-300">
                        {t("landing.features.learnMore")} <span aria-hidden="true">→</span>
                      </span>
                    )}
                  </div>
                </div>
              );

              return feature.href ? (
                <Link key={feature.key} href={feature.href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-400 focus-visible:ring-offset-2">
                  {Card}
                </Link>
              ) : (
                <div key={feature.key}>{Card}</div>
              );
            })}
          </div>
          </section>
        </div>
      </section>

      {/* Showcase Section — Tropical Dive Imagery */}
      <section className="bg-gradient-to-b from-white to-ocean-50/40 py-16 transition-colors dark:from-slate-950 dark:to-ocean-900/10">
        <div className="mx-auto w-full max-w-5xl px-6">
          <div className="grid gap-4 md:grid-cols-3 md:grid-rows-2">
            <div className="relative overflow-hidden rounded-2xl md:row-span-2">
              <Image
                src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=600&q=70"
                alt="Taucher schwebt über Korallenriff"
                width={600}
                height={800}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-abyss-900/70 to-transparent"></div>
              <p className="absolute bottom-4 left-4 text-sm font-semibold text-white drop-shadow-lg">🐢 Tropische Riffe erkunden</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=600&q=70"
                alt="Farbenfrohe Korallen unter Wasser"
                width={600}
                height={400}
                className="h-48 w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-abyss-900/50 to-transparent"></div>
              <p className="absolute bottom-3 left-3 text-xs font-semibold text-white drop-shadow-lg">🪸 Korallenvielfalt</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=600&q=70"
                alt="Tauchergruppe im klaren Wasser"
                width={600}
                height={400}
                className="h-48 w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-abyss-900/50 to-transparent"></div>
              <p className="absolute bottom-3 left-3 text-xs font-semibold text-white drop-shadow-lg">🤿 Buddy-Tauchgänge</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1682687218982-6c508299e107?auto=format&fit=crop&w=600&q=70"
                alt="Türkises Wasser über Sandgrund"
                width={600}
                height={400}
                className="h-48 w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-abyss-900/50 to-transparent"></div>
              <p className="absolute bottom-3 left-3 text-xs font-semibold text-white drop-shadow-lg">🏝️ Tropische Tauchplätze</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&w=600&q=70"
                alt="Unterwasserwelt bei Sonnenuntergang"
                width={600}
                height={400}
                className="h-48 w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-abyss-900/50 to-transparent"></div>
              <p className="absolute bottom-3 left-3 text-xs font-semibold text-white drop-shadow-lg">🌅 Abendliche Tauchgänge</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Full-width Ocean Image */}
      <section className="relative overflow-hidden bg-gradient-to-br from-abyss-900 via-ocean-800 to-reef-700 py-20 dark:from-abyss-900 dark:via-slate-900 dark:to-ocean-900">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1920&q=60"
            alt=""
            fill
            className="object-cover opacity-20 mix-blend-overlay"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-abyss-900/60 to-transparent" aria-hidden="true"></div>
        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            {t("landing.hero.title")}
          </h2>
          <p className="text-lg text-ocean-100/80">
            {t("landing.hero.subtitle")}
          </p>
          <div className="flex flex-col gap-3 md:flex-row">
            <Link
              href="/auth/register"
              className="rounded-full bg-gradient-to-r from-coral-500 to-coral-400 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-coral-500/30 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              {t("landing.hero.cta.register")}
            </Link>
            <Link
              href="/dashboard/community"
              className="rounded-full border-2 border-white/30 bg-white/10 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/20"
            >
              {t("landing.hero.cta.explore")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
