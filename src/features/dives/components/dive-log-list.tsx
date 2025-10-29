"use client";

import { useMemo, useState, type ChangeEvent } from "react";

import type { DiveLogPreview } from "@/data/mock-data";
import { useDemoData } from "@/providers/demo-data-provider";
import { useAuth } from "@/providers/auth-provider";
import { useI18n } from "@/providers/i18n-provider";
import { type SupportedLocale } from "@/i18n/translations";

const localeFormatMap: Record<SupportedLocale, string> = {
  de: "de-DE",
  en: "en-US"
};

function formatDate(value: string, locale: SupportedLocale) {
  return new Date(value).toLocaleDateString(localeFormatMap[locale], {
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
  const { t, locale } = useI18n();
  const [sortBy, setSortBy] = useState<"date" | "duration">("date");
  const [recentOnly, setRecentOnly] = useState(false);
  const depthUnit = t("dashboard.dives.list.depthUnit");
  const durationUnit = t("dashboard.dives.list.durationUnit");

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
          <h2 className="text-lg font-semibold text-slate-900">{t("dashboard.dives.list.heading")}</h2>
          <p className="text-xs text-slate-500">{t("dashboard.dives.list.caption")}</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
          <label className="flex items-center gap-2">
            <span>{t("dashboard.dives.list.sort.label")}</span>
            <select
              value={sortBy}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => setSortBy(event.target.value as "date" | "duration")}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            >
              <option value="date">{t("dashboard.dives.list.sort.date")}</option>
              <option value="duration">{t("dashboard.dives.list.sort.duration")}</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={recentOnly}
              onChange={(event) => setRecentOnly(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-ocean-600 focus:ring-ocean-500"
            />
            {t("dashboard.dives.list.filter.recent")}
          </label>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {visibleLogs.map((log) => (
          <article
            key={log.id}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-900">{log.title}</h3>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
                #{log.logNumber}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{log.location}</p>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">{t("dashboard.dives.list.field.date")}</dt>
                <dd>{formatDate(log.date, locale)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">{t("dashboard.dives.list.field.buddy")}</dt>
                <dd>{log.buddy}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">{t("dashboard.dives.list.field.depth")}</dt>
                <dd>{`${log.depth} ${depthUnit}`}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">{t("dashboard.dives.list.field.duration")}</dt>
                <dd>{`${log.duration} ${durationUnit}`}</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold">
              <button
                type="button"
                onClick={() => onEdit?.(log)}
                className="text-ocean-700 underline-offset-2 hover:underline"
              >
                {t("dashboard.dives.list.action.edit")}
              </button>
              <span aria-hidden="true" className="text-slate-300">
                |
              </span>
              <button
                type="button"
                onClick={() => removeDiveLog(log.id)}
                className="text-rose-600 underline-offset-2 hover:underline"
              >
                {t("dashboard.dives.list.action.delete")}
              </button>
            </div>
          </article>
        ))}
        {visibleLogs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            {t("dashboard.dives.list.empty")}
          </div>
        )}
      </div>
    </div>
  );
}
