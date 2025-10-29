"use client";

import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";

import type { DiveLogPreview } from "@/data/mock-data";
import { useDemoData } from "@/providers/demo-data-provider";
import { useI18n } from "@/providers/i18n-provider";

type DifficultyValue = "" | DiveLogPreview["difficulty"];

export function DiveSearchPanel() {
  const { t, locale } = useI18n();
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyValue>("");
  const { diveLogs } = useDemoData();

  const difficultyOptions = useMemo(
    () => [
      { value: "" as DifficultyValue, label: t("dashboard.search.filters.difficulty.options.all") },
      { value: "Beginner" as DifficultyValue, label: t("dashboard.search.filters.difficulty.options.beginner") },
      { value: "Fortgeschritten" as DifficultyValue, label: t("dashboard.search.filters.difficulty.options.advanced") },
      { value: "Pro" as DifficultyValue, label: t("dashboard.search.filters.difficulty.options.pro") }
    ],
    [t]
  );

  const difficultyLabelMap = useMemo<Record<DiveLogPreview["difficulty"], string>>(
    () => ({
      Beginner: t("dashboard.search.results.difficulty.beginner"),
      Fortgeschritten: t("dashboard.search.results.difficulty.advanced"),
      Pro: t("dashboard.search.results.difficulty.pro")
    }),
    [t]
  );

  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(locale), [locale]);
  const numberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return diveLogs.filter((log) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [log.title, log.location, log.buddy].join(" ").toLowerCase().includes(normalizedQuery);

      if (!difficulty) {
        return matchesQuery;
      }

      return matchesQuery && log.difficulty === difficulty;
    });
  }, [difficulty, diveLogs, query]);

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleDifficultyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setDifficulty(event.target.value as DifficultyValue);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          {t("dashboard.search.filters.query.label")}
          <input
            value={query}
            onChange={handleQueryChange}
            placeholder={t("dashboard.search.filters.query.placeholder")}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          {t("dashboard.search.filters.difficulty.label")}
          <select
            value={difficulty}
            onChange={handleDifficultyChange}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
          >
            {difficultyOptions.map((item) => (
              <option key={item.value || "all"} value={item.value}>
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
                {difficultyLabelMap[log.difficulty] ?? t("dashboard.search.results.difficulty.unknown")}
              </span>
            </header>
            <p className="mt-1 text-sm text-slate-500">{log.location}</p>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">{t("dashboard.search.results.meta.buddy")}</dt>
                <dd>{log.buddy}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">{t("dashboard.search.results.meta.depth")}</dt>
                <dd>
                  {numberFormatter.format(log.depth)} {t("dashboard.search.results.depth.unit")}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">{t("dashboard.search.results.meta.duration")}</dt>
                <dd>
                  {numberFormatter.format(log.duration)} {t("dashboard.search.results.duration.unit")}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">{t("dashboard.search.results.meta.date")}</dt>
                <dd>{dateFormatter.format(new Date(log.date))}</dd>
              </div>
            </dl>
          </article>
        ))}

        {results.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            {t("dashboard.search.results.empty")}
          </div>
        )}
      </div>
    </div>
  );
}
