"use client";

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
};

const featureHighlights: FeatureHighlight[] = [
  {
    key: "dives",
    accentKey: "landing.features.dives.accent",
    titleKey: "landing.features.dives.title",
    descriptionKey: "landing.features.dives.description",
    href: "/dashboard/dives"
  },
  {
    key: "equipment",
    accentKey: "landing.features.equipment.accent",
    titleKey: "landing.features.equipment.title",
    descriptionKey: "landing.features.equipment.description",
    href: "/dashboard/equipment"
  },
  {
    key: "members",
    accentKey: "landing.features.members.accent",
    titleKey: "landing.features.members.title",
    descriptionKey: "landing.features.members.description",
    href: "/dashboard/members"
  },
  {
    key: "community",
    accentKey: "landing.features.community.accent",
    titleKey: "landing.features.community.title",
    descriptionKey: "landing.features.community.description",
    href: "/dashboard/community"
  },
  {
    key: "account",
    accentKey: "landing.features.account.accent",
    titleKey: "landing.features.account.title",
    descriptionKey: "landing.features.account.description"
  },
  {
    key: "social",
    accentKey: "landing.features.social.accent",
    titleKey: "landing.features.social.title",
    descriptionKey: "landing.features.social.description"
  },
  {
    key: "workflows",
    accentKey: "landing.features.workflows.accent",
    titleKey: "landing.features.workflows.title",
    descriptionKey: "landing.features.workflows.description"
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
      {/* Hero Section with Ocean Background */}
      <section className="relative overflow-hidden bg-gradient-to-b from-ocean-900 via-ocean-800 to-ocean-700 transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        {/* Dark Overlay for better contrast */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 600%22><defs><pattern id=%22ocean%22 x=%220%22 y=%220%22 width=%22100%22 height=%22100%22 patternUnits=%22userSpaceOnUse%22><path d=%22M0,50 Q25,30 50,50 T100,50%22 fill=%22none%22 stroke=%22rgba(255,255,255,0.1)%22 stroke-width=%222%22/><circle cx=%2220%22 cy=%2230%22 r=%222%22 fill=%22rgba(255,255,255,0.15)%22/><circle cx=%2280%22 cy=%2270%22 r=%223%22 fill=%22rgba(255,255,255,0.1)%22/></pattern></defs><rect width=%221200%22 height=%22600%22 fill=%22url(%23ocean)%22/></svg>')] opacity-30 animate-pulse"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-ocean-400 rounded-full opacity-5 blur-3xl animate-float" style={{ animationDuration: '8s' }}></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-ocean-300 rounded-full opacity-5 blur-3xl animate-float" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-ocean-500 rounded-full opacity-5 blur-3xl animate-float" style={{ animationDuration: '10s', animationDelay: '4s' }}></div>
        </div>

        {/* Content */}
        <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
          <div className="flex flex-col gap-6 text-center">
            <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-1 text-sm text-slate-700 transition-colors dark:border-ocean-200/50 dark:bg-ocean-400/20 dark:text-ocean-100">
              🌊 {t("landing.hero.badge")}
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
              {t("landing.hero.title")}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white dark:text-ocean-100">
              {t("landing.hero.subtitle")}
            </p>
            {currentUser ? (
              <div className="flex justify-center pt-2">
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-ocean-700 shadow transition duration-200 hover:-translate-y-0.5 hover:bg-ocean-50 hover:shadow-lg"
                >
                  {t("landing.hero.cta.explore")}
                </Link>
              </div>
            ) : (
              <>
                <div className="flex flex-col justify-center gap-3 pt-2 md:flex-row">
                  <Link
                    href="/auth/register"
                    className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-ocean-700 shadow transition duration-200 hover:-translate-y-0.5 hover:shadow-lg border-2 border-transparent dark:border-white/30 dark:text-white dark:bg-transparent dark:hover:bg-white/10 dark:hover:border-white/50"
                  >
                    {t("landing.hero.cta.register")}
                  </Link>
                  <Link
                    href="/auth/login"
                    className="rounded-lg border-2 border-white px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white/20 hover:shadow-lg dark:border-white/30 dark:bg-ocean-500 dark:hover:bg-ocean-600 dark:hover:border-white/30"
                  >
                    {t("landing.hero.cta.login")}
                  </Link>
                  <Link
                    href="/dashboard/community"
                    className="rounded-lg border-2 border-white px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white/20 hover:shadow-lg dark:border-white/30 dark:hover:border-white/50 dark:hover:bg-white/10"
                  >
                    {t("landing.hero.cta.explore")}
                  </Link>
                </div>
                <p className="text-sm text-white dark:text-ocean-100 transition-colors">
                  {t("landing.hero.caption")}
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white transition-colors dark:bg-gradient-to-b dark:from-slate-950 dark:to-slate-900">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
          <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/60">
          <header className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-semibold text-slate-900 transition-colors dark:text-slate-100">
              {t("landing.features.heading")}
            </h2>
            <p className="text-sm text-slate-700 transition-colors dark:text-slate-300">
              {t("landing.features.description")}
            </p>
          </header>
          <div className="grid gap-4 md:grid-cols-3">
            {featureHighlights.map((feature) => {
              const Card = (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-ocean-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-ocean-500">
                  <span className="mb-3 inline-flex items-center rounded-full border border-ocean-200 bg-ocean-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-ocean-700 dark:border-ocean-700 dark:bg-ocean-900/40 dark:text-ocean-300">
                    {t(feature.accentKey)}
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900 transition-colors dark:text-slate-100">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="mt-2 text-sm text-slate-700 transition-colors dark:text-slate-300">
                    {t(feature.descriptionKey)}
                  </p>
                  {feature.href && (
                    <span className="mt-4 inline-flex items-center text-sm font-semibold text-ocean-600 transition-colors dark:text-ocean-300">
                      {t("landing.features.learnMore")}
                    </span>
                  )}
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
    </>
  );
}
