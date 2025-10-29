"use client";

import { useState } from "react";

import type { DiveLogPreview } from "@/data/mock-data";
import { AddDiveLogForm } from "@/features/dives/components/add-dive-log-form";
import { DiveLogList } from "@/features/dives/components/dive-log-list";
import { useDemoData } from "@/providers/demo-data-provider";

export default function DashboardDivesPage() {
  const { diveLogs } = useDemoData();
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);

  const editingLog: DiveLogPreview | null =
    editingLogId ? diveLogs.find((log) => log.id === editingLogId) ?? null : null;

  const handleToggleForm = () => {
    if (formVisible) {
      setFormVisible(false);
      setEditingLogId(null);
    } else {
      setEditingLogId(null);
      setFormVisible(true);
    }
  };

  const handleEditLog = (log: DiveLogPreview) => {
    setEditingLogId(log.id);
    setFormVisible(true);
  };

  const handleResetForm = () => {
    setEditingLogId(null);
    setFormVisible(false);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tauchgänge</h1>
          <p className="text-sm text-slate-600">
            Demo-Übersicht deiner letzten Logbuch-Einträge inklusive Buddy, Tiefe und Dauer.
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggleForm}
          className="inline-flex items-center justify-center rounded-xl bg-ocean-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-ocean-700"
          aria-expanded={formVisible}
        >
          Neuer Logbucheintrag
        </button>
      </header>
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <DiveLogList onEdit={handleEditLog} />
        {formVisible && (
          <AddDiveLogForm
            key={editingLog?.id ?? "new"}
            initialValue={editingLog}
            onSubmitSuccess={handleResetForm}
            onCancelEdit={handleResetForm}
          />
        )}
      </div>
    </div>
  );
}
