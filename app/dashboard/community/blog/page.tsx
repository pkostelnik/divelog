'use client';

import { useState } from "react";

import { CommunityHighlights } from "@/features/community/components/community-highlights";
import { CommunityPostForm } from "@/features/community/components/community-post-form";

export default function CommunityBlogPage() {
  const [formVisible, setFormVisible] = useState(false);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Community Blog</h1>
          <p className="text-sm text-slate-600">
            Teile ausführliche Erfahrungsberichte, Tipps und inspiriere andere Taucher:innen mit deinen Stories.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormVisible((previous) => !previous)}
          className="inline-flex items-center justify-center rounded-xl bg-ocean-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-ocean-700"
          aria-expanded={formVisible}
        >
          Neuer Beitrag
        </button>
      </header>
      {formVisible && (
        <CommunityPostForm onSubmitSuccess={() => setFormVisible(false)} />
      )}
      <CommunityHighlights />
    </div>
  );
}
