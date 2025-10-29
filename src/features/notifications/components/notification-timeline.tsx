"use client";

import { useMemo } from "react";

import { useDemoData } from "@/providers/demo-data-provider";
import { useI18n } from "@/providers/i18n-provider";

function formatRelative(value: string, formatter: Intl.RelativeTimeFormat) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) {
    return formatter.format(-minutes, "minute");
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return formatter.format(-hours, "hour");
  }
  const days = Math.floor(hours / 24);
  return formatter.format(-days, "day");
}

export function NotificationTimeline() {
  const { t, locale } = useI18n();
  const { notifications, markNotification, dismissNotification } = useDemoData();
  const relativeFormatter = useMemo(() => new Intl.RelativeTimeFormat(locale, { numeric: "always" }), [locale]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">{t("dashboard.notifications.section.title")}</h2>
        <p className="text-xs text-slate-500">
          {t("dashboard.notifications.section.subtitle")}
        </p>
      </div>
      <ol className="relative space-y-4 border-l border-slate-200 pl-6">
        {notifications.map((note) => (
          <li key={note.id} className="space-y-2">
            <div className="absolute -left-[10px] h-2.5 w-2.5 rounded-full border border-white bg-ocean-500" />
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-slate-900">{note.title}</p>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => markNotification(note.id, !note.read)}
                  className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-600 transition hover:border-ocean-300 hover:text-ocean-700"
                >
                  {note.read
                    ? t("dashboard.notifications.actions.markUnread")
                    : t("dashboard.notifications.actions.markRead")}
                </button>
                <button
                  type="button"
                  onClick={() => dismissNotification(note.id)}
                  className="rounded-full border border-transparent px-3 py-1 font-semibold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
                >
                  {t("dashboard.notifications.actions.dismiss")}
                </button>
              </div>
            </div>
            <p className="text-sm text-slate-600">{note.description}</p>
            <p className="text-xs uppercase text-slate-400">
              {t("dashboard.notifications.meta.prefix").replace(
                "{relative}",
                formatRelative(note.timestamp, relativeFormatter)
              )}
              {note.read ? ` ${t("dashboard.notifications.meta.read")}` : ""}
            </p>
          </li>
        ))}
        {notifications.length === 0 && (
          <li className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            {t("dashboard.notifications.empty")}
          </li>
        )}
      </ol>
    </div>
  );
}
