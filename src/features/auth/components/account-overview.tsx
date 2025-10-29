"use client";

import Link from "next/link";

import { useAuth } from "@/providers/auth-provider";

function formatDate(value: string) {
  return new Date(value).toLocaleString("de-DE", {
    dateStyle: "long"
  });
}

export function AccountOverview() {
  const { currentUser, loginAsDemoMember, logout } = useAuth();

  if (!currentUser) {
    return (
      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Kein Account angemeldet</h1>
        <p className="text-sm text-slate-600">
          Melde dich an, um persönliche Logbücher, Lieblingsspots und Trainingsziele zu verwalten.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/auth/login"
            className="rounded-xl bg-ocean-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-ocean-700"
          >
            Zur Anmeldung
          </Link>
          <Link
            href="/auth/register"
            className="rounded-xl border border-ocean-200 px-4 py-2 text-sm font-semibold text-ocean-700 shadow-sm transition hover:border-ocean-400 hover:text-ocean-800"
          >
            Jetzt registrieren
          </Link>
          <button
            type="button"
            onClick={() => loginAsDemoMember()}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-700"
          >
            Demo-Zugang nutzen
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Hallo {currentUser.name}
        </h1>
        <p className="text-sm text-slate-600">
          Willkommen in deinem persönlichen Bereich. Hier findest du deine Stammdaten und Highlights.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Mitgliedsdaten</h2>
          <dl className="grid gap-3 md:grid-cols-2 text-sm text-slate-600">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rolle</dt>
              <dd>{currentUser.role === "admin" ? "Administrator" : "Mitglied"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">E-Mail</dt>
              <dd>{currentUser.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mitglied seit</dt>
              <dd>{formatDate(currentUser.joinedAt)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Wohnort</dt>
              <dd>{currentUser.city || "Noch nicht angegeben"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lieblingsplatz</dt>
              <dd>{currentUser.favoriteDiveSite || "Noch nicht angegeben"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Logbucheinträge</dt>
              <dd>{currentUser.completedDives} Tauchgänge</dd>
            </div>
          </dl>
          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            {currentUser.about}
          </p>
          {currentUser.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {currentUser.certifications.map((cert) => (
                <span
                  key={cert}
                  className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600"
                >
                  {cert}
                </span>
              ))}
            </div>
          )}
        </article>
        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Schnellaktionen</h2>
          <div className="space-y-3 text-sm text-slate-600">
            <p>
              Plane deinen nächsten Club-Trip über das Forum oder teile Highlights im Community Blog.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/dashboard/community/blog"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-ocean-300 hover:text-ocean-700"
              >
                Beitrag im Blog posten
              </Link>
              <Link
                href="/dashboard/community/forum"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-ocean-300 hover:text-ocean-700"
              >
                Diskussion im Forum starten
              </Link>
            </div>
            <button
              type="button"
              onClick={logout}
              className="w-full rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
            >
              Abmelden
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
