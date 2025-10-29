"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { useAuth } from "@/providers/auth-provider";
import { useAccountActions } from "../hooks/use-account-actions";

function formatDate(value: string) {
  return new Date(value).toLocaleString("de-DE", {
    dateStyle: "long"
  });
}

export function AccountOverview() {
  const { currentUser, loginAsDemoMember, logout } = useAuth();
  const { resetPassword, deleteAccount } = useAccountActions();
  const [actionFeedback, setActionFeedback] = useState<{ variant: "success" | "error"; message: string } | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const handlePasswordReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) {
      return;
    }

    const trimmed = passwordInput.trim();
    if (trimmed.length < 6) {
      setActionFeedback({ variant: "error", message: "Passwort benötigt mindestens 6 Zeichen." });
      return;
    }

    const result = await resetPassword({ memberId: currentUser.id, newPassword: trimmed });
    if (!result.success) {
      setActionFeedback({ variant: "error", message: result.error ?? "Passwort konnte nicht aktualisiert werden." });
      return;
    }
    setPasswordInput("");
    setShowPasswordForm(false);
    setActionFeedback({ variant: "success", message: "Passwort wurde erfolgreich aktualisiert." });
  };

  const handleAccountRemoval = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) {
      return;
    }

    if (deleteConfirmation.trim().toLowerCase() !== currentUser.email.toLowerCase()) {
      setActionFeedback({
        variant: "error",
        message: "Bitte bestätige die Löschung, indem du deine E-Mail korrekt eingibst."
      });
      return;
    }

    const result = await deleteAccount({ memberId: currentUser.id, placeholderName: "Gelöschtes Mitglied" });
    if (!result.success) {
      setActionFeedback({ variant: "error", message: result.error ?? "Konto konnte nicht gelöscht werden." });
      return;
    }

    window.alert("Dein Konto wurde gelöscht. Du wirst zur Anmeldung zurückgeführt.");
    setDeleteConfirmation("");
    setShowDeleteForm(false);
    logout();
  };

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
              <button
                type="button"
                onClick={() => {
                  setActionFeedback(null);
                  setShowPasswordForm((value) => !value);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-800"
              >
                Passwort zurücksetzen
              </button>
            </div>
            {showPasswordForm && (
              <form onSubmit={handlePasswordReset} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-600">Neues Passwort festlegen (mindestens 6 Zeichen).</p>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(event) => setPasswordInput(event.target.value)}
                  placeholder={currentUser ? (currentUser.role === "admin" ? "Admin!123" : "Tauchen!123") : ""}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                />
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <button
                    type="submit"
                    className="rounded-xl bg-ocean-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-ocean-700"
                  >
                    Passwort speichern
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordInput("");
                      setShowPasswordForm(false);
                    }}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-800"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            )}
            <button
              type="button"
              onClick={logout}
              className="w-full rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
            >
              Abmelden
            </button>
            <button
              type="button"
              onClick={() => {
                setActionFeedback(null);
                setShowDeleteForm((value) => !value);
              }}
              className="w-full rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-400 hover:bg-rose-100"
            >
              Konto löschen
            </button>
            {showDeleteForm && currentUser && (
              <form
                onSubmit={handleAccountRemoval}
                className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4"
              >
                <p className="text-xs font-medium text-rose-700">
                  Bestätige die Löschung, indem du deine E-Mail <span className="font-semibold">{currentUser.email}</span> eingibst.
                  Alle eigenen Inhalte werden entfernt oder anonymisiert.
                </p>
                <input
                  type="email"
                  value={deleteConfirmation}
                  onChange={(event) => setDeleteConfirmation(event.target.value)}
                  placeholder={currentUser.email}
                  className="w-full rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
                  >
                    Löschung bestätigen
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmation("");
                      setShowDeleteForm(false);
                    }}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-800"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            )}
            {actionFeedback && (
              <p
                className={`rounded-xl px-4 py-2 text-xs font-semibold ${
                  actionFeedback.variant === "success"
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {actionFeedback.message}
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
