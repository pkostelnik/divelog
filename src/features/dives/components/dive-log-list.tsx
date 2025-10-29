'use client';

import { useMemo, useState, type ChangeEvent } from "react";

import type { DiveLogPreview } from "@/data/mock-data";
import { useDemoData } from "@/providers/demo-data-provider";
import { useAuth } from "@/providers/auth-provider";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

type DiveLogListProps = {
  onEdit?: (log: DiveLogPreview) => void;
};

export function DiveLogList({ onEdit }: DiveLogListProps) {
  const { diveLogs, removeDiveLog } = useDemoData();
  const { currentUser } = useAuth();
  const [sortBy, setSortBy] = useState<"date" | "duration">("date");
  const [recentOnly, setRecentOnly] = useState(false);

  const userFilteredLogs = useMemo(() => {
    if (!currentUser?.id || currentUser.role === "admin") {
      return diveLogs;
    }

    // Keep legacy entries without diver assignments visible while data migrates.
    return diveLogs.filter((log) => !log.diverId || log.diverId === currentUser.id);
  }, [diveLogs, currentUser?.id, currentUser?.role]);

  const visibleLogs = useMemo(() => {
    const filtered = recentOnly
      ? userFilteredLogs.filter((log) => {
          const daysDiff = (Date.now() - new Date(log.date).getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 60;
        })
      : userFilteredLogs;

    return [...filtered].sort((a, b) => {
      if (sortBy === "duration") {
        return b.duration - a.duration;
      }

      return b.date.localeCompare(a.date);
    });
  }, [userFilteredLogs, sortBy, recentOnly]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Neueste Tauchgänge</h2>
          <p className="text-xs text-slate-500">Live-Änderungen bleiben in dieser Session erhalten.</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
          <label className="flex items-center gap-2">
            <span>Sortierung</span>
            <select
              value={sortBy}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => setSortBy(event.target.value as "date" | "duration")}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            >
              <option value="date">Neueste zuerst</option>
              <option value="duration">Längste Dauer</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={recentOnly}
              onChange={(event) => setRecentOnly(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-ocean-600 focus:ring-ocean-500"
            />
            Nur letzte 60 Tage
          </label>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {visibleLogs.map((log) => (
          <article
            key={log.id}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
          >
            <h3 className="text-base font-semibold text-slate-900">{log.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{log.location}</p>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Datum</dt>
                <dd>{formatDate(log.date)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Buddy</dt>
                <dd>{log.buddy}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Tiefe</dt>
                <dd>{log.depth} m</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Dauer</dt>
                <dd>{log.duration} min</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold">
              <button
                type="button"
                onClick={() => onEdit?.(log)}
                className="text-ocean-700 underline-offset-2 hover:underline"
              >
                Bearbeiten
              </button>
              <span aria-hidden="true" className="text-slate-300">
                |
              </span>
              <button
                type="button"
                onClick={() => removeDiveLog(log.id)}
                className="text-rose-600 underline-offset-2 hover:underline"
              >
                Löschen
              </button>
            </div>
          </article>
        ))}
        {visibleLogs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Keine Treffer mit dieser Filterkombination.
          </div>
        )}
      </div>
    </div>
  );
}
