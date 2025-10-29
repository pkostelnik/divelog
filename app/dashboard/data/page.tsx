"use client";

import Link from "next/link";

import { useI18n } from "@/providers/i18n-provider";

type DataSection = {
  key: "media" | "equipment" | "sites";
  href: string;
};

const dataSections: DataSection[] = [
  { key: "media", href: "/dashboard/media" },
  { key: "equipment", href: "/dashboard/equipment" },
  { key: "sites", href: "/dashboard/sites" }
];

export default function DashboardDataPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("dashboard.data.heading")}</h1>
        <p className="text-sm text-slate-600">{t("dashboard.data.subtitle")}</p>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        {dataSections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-ocean-400 hover:shadow-lg"
          >
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ocean-600">{t("dashboard.data.badge")}</p>
              <h2 className="text-xl font-semibold text-slate-900">{t(`dashboard.data.section.${section.key}.title`)}</h2>
              <p className="text-sm text-slate-600">{t(`dashboard.data.section.${section.key}.description`)}</p>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ocean-600 group-hover:underline">
              {t(`dashboard.data.section.${section.key}.cta`)}
              <span aria-hidden>→</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
