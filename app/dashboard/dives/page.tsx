"use client";

import { useState } from "react";

import type { DiveLogPreview } from "@/data/mock-data";
import { AddDiveLogForm } from "@/features/dives/components/add-dive-log-form";
import { DiveLogList } from "@/features/dives/components/dive-log-list";
import { useDemoData } from "@/providers/demo-data-provider";

export default function DashboardDivesPage() {
  const { diveLogs } = useDemoData();
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  const editingLog: DiveLogPreview | null =
    editingLogId ? diveLogs.find((log) => log.id === editingLogId) ?? null : null;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tauchgänge</h1>
        <p className="text-sm text-slate-600">
          Demo-Übersicht deiner letzten Logbuch-Einträge inklusive Buddy, Tiefe und Dauer.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <DiveLogList onEdit={(log) => setEditingLogId(log.id)} />
        <AddDiveLogForm
          key={editingLog?.id ?? "new"}
          initialValue={editingLog}
          onSubmitSuccess={() => setEditingLogId(null)}
          onCancelEdit={() => setEditingLogId(null)}
        />
      </div>
    </div>
  );
}
