"use client";

import { useDemoData } from "@/providers/demo-data-provider";

function formatRelative(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} Minuten`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} Stunden`;
  const days = Math.floor(hours / 24);
  return `${days} Tage`;
}

export function NotificationTimeline() {
  const { notifications, markNotification, dismissNotification } = useDemoData();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Benachrichtigungen</h2>
        <p className="text-xs text-slate-500">
          Markiere Einträge als gelesen oder entferne sie dauerhaft aus der Liste.
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
                  {note.read ? "Als ungelesen markieren" : "Als gelesen markieren"}
                </button>
                <button
                  type="button"
                  onClick={() => dismissNotification(note.id)}
                  className="rounded-full border border-transparent px-3 py-1 font-semibold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
                >
                  Entfernen
                </button>
              </div>
            </div>
            <p className="text-sm text-slate-600">{note.description}</p>
            <p className="text-xs uppercase text-slate-400">
              vor {formatRelative(note.timestamp)}
              {note.read ? " - gelesen" : ""}
            </p>
          </li>
        ))}
        {notifications.length === 0 && (
          <li className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            Alle Benachrichtigungen erledigt.
          </li>
        )}
      </ol>
    </div>
  );
}
