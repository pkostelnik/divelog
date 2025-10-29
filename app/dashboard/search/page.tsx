"use client";

import { DiveSearchPanel } from "@/features/search/components/dive-search-panel";
import { useI18n } from "@/providers/i18n-provider";

export default function DashboardSearchPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("dashboard.search.heading")}</h1>
        <p className="text-sm text-slate-600">{t("dashboard.search.description")}</p>
      </header>
      <DiveSearchPanel />
    </div>
  );
}
