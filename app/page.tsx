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
    <section className="bg-gradient-to-b from-white to-slate-100 transition-colors dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-24">
        <div className="flex flex-col gap-6 text-center">
          <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-ocean-200 bg-ocean-50 px-4 py-1 text-sm text-ocean-700 transition-colors dark:border-ocean-800 dark:bg-ocean-900/40 dark:text-ocean-200">
            {t("landing.hero.badge")}
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 transition-colors dark:text-slate-100 md:text-5xl">
            {t("landing.hero.title")}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 transition-colors dark:text-slate-300">
            {t("landing.hero.subtitle")}
          </p>
          {currentUser ? (
            <div className="flex justify-center">
              <Link
                href="/dashboard"
                className="rounded-lg bg-ocean-600 px-5 py-3 text-sm font-semibold text-white shadow transition duration-200 hover:-translate-y-0.5 hover:bg-ocean-700 dark:hover:bg-ocean-500"
              >
                {t("landing.hero.cta.explore")}
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-col justify-center gap-3 md:flex-row">
                <Link
                  href="/auth/register"
                  className="rounded-lg bg-ocean-600 px-5 py-3 text-sm font-semibold text-white shadow transition duration-200 hover:-translate-y-0.5 hover:bg-ocean-700 dark:hover:bg-ocean-500"
                >
                  {t("landing.hero.cta.register")}
                </Link>
                <Link
                  href="/auth/login"
                  className="rounded-lg border border-ocean-200 px-5 py-3 text-sm font-semibold text-ocean-700 shadow-sm transition duration-200 hover:border-ocean-400 hover:text-ocean-800 dark:border-ocean-800 dark:text-ocean-200 dark:hover:border-ocean-600 dark:hover:text-ocean-100"
                >
                  {t("landing.hero.cta.login")}
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-slate-100"
                >
                  {t("landing.hero.cta.explore")}
                </Link>
              </div>
              <p className="text-sm text-slate-500 transition-colors dark:text-slate-400">
                {t("landing.hero.caption")}
              </p>
            </>
          )}
        </div>

        <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/60">
          <header className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-semibold text-slate-900 transition-colors dark:text-slate-100">
              {t("landing.features.heading")}
            </h2>
            <p className="text-sm text-slate-600 transition-colors dark:text-slate-300">
              {t("landing.features.description")}
            </p>
          </header>
          <div className="grid gap-4 md:grid-cols-3">
            {featureHighlights.map((feature) => {
              const Card = (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-0.5 hover:border-ocean-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-ocean-500">
                  <span className="mb-3 inline-flex items-center rounded-full border border-ocean-200 bg-ocean-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-ocean-700 dark:border-ocean-700 dark:bg-ocean-900/40 dark:text-ocean-300">
                    {t(feature.accentKey)}
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900 transition-colors dark:text-slate-100">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 transition-colors dark:text-slate-300">
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
  );
}
