"use client";

import { useMemo } from "react";
import Link from "next/link";

import { useI18n } from "@/providers/i18n-provider";

export default function DashboardCommunityPage() {
  const { t } = useI18n();

  const communitySections = useMemo(() => ([
    {
      title: t("dashboard.community.sections.blog.title"),
      description: t("dashboard.community.sections.blog.description"),
      href: "/dashboard/community/blog",
      cta: t("dashboard.community.sections.blog.cta")
    },
    {
      title: t("dashboard.community.sections.forum.title"),
      description: t("dashboard.community.sections.forum.description"),
      href: "/dashboard/community/forum",
      cta: t("dashboard.community.sections.forum.cta")
    }
  ]), [t]);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("dashboard.community.heading")}</h1>
        <p className="text-sm text-slate-600">
          {t("dashboard.community.description")}
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        {communitySections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-ocean-400 hover:shadow-lg"
          >
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ocean-600">
                {t("dashboard.community.sectionBadge")}
              </p>
              <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
              <p className="text-sm text-slate-600">{section.description}</p>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ocean-600 group-hover:underline">
              {section.cta}
              <span aria-hidden>→</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
