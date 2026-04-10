"use client";

import { useState } from "react";

import Image from "next/image";

import { DiveSiteGallery } from "@/features/sites/components/dive-site-gallery";
import { useI18n } from "@/providers/i18n-provider";

export default function DashboardSitesPage() {
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      {/* Sites Hero Banner */}
      <div className="relative -m-8 mb-0 overflow-hidden rounded-t-3xl">
        <Image
          src="https://images.unsplash.com/photo-1682687218982-6c508299e107?auto=format&fit=crop&w=1400&q=70"
          alt="Kristallklares tropisches Wasser über Korallenriff"
          width={1400}
          height={400}
          className="h-36 w-full object-cover sm:h-44"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent dark:from-[#0c1f2e] dark:via-[#0c1f2e]/60"></div>
      </div>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("dashboard.sites.heading")}</h1>
          <p className="text-sm text-slate-600">{t("dashboard.sites.description")}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateFormVisible((previous) => !previous)}
          className="inline-flex items-center justify-center rounded-xl border border-ocean-200 bg-white px-4 py-2 text-sm font-semibold text-ocean-700 shadow-sm transition hover:border-ocean-300 hover:text-ocean-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-300"
          aria-expanded={isCreateFormVisible}
        >
          {isCreateFormVisible
            ? t("dashboard.sites.actions.toggle.close")
            : t("dashboard.sites.actions.toggle.open")}
        </button>
      </header>
      <DiveSiteGallery showCreateForm={isCreateFormVisible} />
    </div>
  );
}
