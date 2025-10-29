"use client";

import { useState } from "react";

import { DiveSiteGallery } from "@/features/sites/components/dive-site-gallery";

export default function DashboardSitesPage() {
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tauchplätze</h1>
          <p className="text-sm text-slate-600">
            Inspiration für kommende Trips inklusive Schwierigkeit, Highlights und visuellen Eindrücken.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateFormVisible((previous) => !previous)}
          className="inline-flex items-center justify-center rounded-xl border border-ocean-200 bg-white px-4 py-2 text-sm font-semibold text-ocean-700 shadow-sm transition hover:border-ocean-300 hover:text-ocean-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-300"
          aria-expanded={isCreateFormVisible}
        >
          {isCreateFormVisible ? "Formular schließen" : "Tauchplatz hinzufügen"}
        </button>
      </header>
      <DiveSiteGallery showCreateForm={isCreateFormVisible} />
    </div>
  );
}
