'use client';

import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";

import type { DiveLogPreview } from "@/data/mock-data";
import { useDemoData } from "@/providers/demo-data-provider";

const difficultyOptions = [
  { value: "", label: "Alle Schwierigkeitsgrade" },
  { value: "Beginner", label: "Beginner" },
  { value: "Fortgeschritten", label: "Fortgeschritten" },
  { value: "Pro", label: "Pro" }
];

export function DiveSearchPanel() {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const { diveLogs } = useDemoData();

  const results = useMemo(() => {
    return diveLogs.filter((log) => {
      const matchesQuery = [log.title, log.location, log.buddy]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());

      if (!difficulty) {
        return matchesQuery;
      }

      return matchesQuery && log.difficulty === difficulty;
    });
  }, [difficulty, diveLogs, query]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Suchbegriff
          <input
            value={query}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
            placeholder="Suche nach Spot, Buddy oder Titel"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Schwierigkeitsgrad
          <select
            value={difficulty}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => setDifficulty(event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
          >
            {difficultyOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {results.map((log: DiveLogPreview) => (
          <article
            key={log.id}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
          >
            <header className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">{log.title}</h3>
              <span className="rounded-full bg-ocean-50 px-3 py-1 text-xs font-semibold text-ocean-700">
                {log.difficulty ?? "n/a"}
              </span>
            </header>
            <p className="mt-1 text-sm text-slate-500">{log.location}</p>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600">
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
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Datum</dt>
                <dd>{new Date(log.date).toLocaleDateString("de-DE")}</dd>
              </div>
            </dl>
          </article>
        ))}

        {results.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Keine Treffer - passe deine Suche an.
          </div>
        )}
      </div>
    </div>
  );
}
