"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";

import type { MemberProfile, MemberRole } from "@/data/mock-data";
import { useAuth } from "@/providers/auth-provider";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "short"
  });
}

function roleLabel(role: string) {
  if (role === "admin") {
    return "Administrator";
  }
  return "Mitglied";
}

type MemberFormState = {
  name: string;
  email: string;
  role: MemberRole;
  city: string;
  favoriteDiveSite: string;
  about: string;
  certifications: string;
  completedDives: string;
};

type AlertRecord = Record<string, { variant: "success" | "error"; message: string }>;

type DirectoryMember = Omit<MemberProfile, "password">;

export function MemberDirectory() {
  const { members, currentUser, updateMember, resetMemberPassword, removeMember } = useAuth();
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [formState, setFormState] = useState<MemberFormState | null>(null);
  const [alerts, setAlerts] = useState<AlertRecord>({});
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAdmin = currentUser?.role === "admin";

  const canDeleteMember = (memberId: string) => {
    if (!isAdmin) {
      return false;
    }
    if (currentUser?.id === memberId) {
      return false;
    }
    return true;
  };

  const items = useMemo(() => {
    return [...members].sort((a, b) => a.name.localeCompare(b.name));
  }, [members]);

  useEffect(() => {
    if (!pendingDeleteId) {
      return;
    }
    const stillExists = members.some((member) => member.id === pendingDeleteId);
    if (!stillExists) {
      setPendingDeleteId(null);
    }
  }, [members, pendingDeleteId]);

  const setAlert = (id: string, variant: "success" | "error", message: string) => {
    setAlerts((previous) => ({ ...previous, [id]: { variant, message } }));
  };

  const clearAlert = (id: string) => {
    setAlerts((previous) => {
      if (!previous[id]) {
        return previous;
      }
      const { [id]: _removed, ...rest } = previous;
      return rest;
    });
  };

  const startEditing = (memberId: string) => {
    const current = members.find((candidate) => candidate.id === memberId);
    if (!current) {
      return;
    }
    clearAlert(memberId);
    setPendingDeleteId(null);
    setEditingMemberId(memberId);
    setFormState({
      name: current.name,
      email: current.email,
      role: current.role,
      city: current.city,
      favoriteDiveSite: current.favoriteDiveSite,
      about: current.about,
      certifications: current.certifications.join(", "),
      completedDives: String(current.completedDives)
    });
  };

  const cancelEditing = () => {
    setEditingMemberId(null);
    setFormState(null);
    setPendingDeleteId(null);
  };

  const handleFormChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormState((previous) => (previous ? { ...previous, [name]: value } : previous));
  };

  const handleMemberSubmit = async (event: FormEvent<HTMLFormElement>, memberId: string) => {
    event.preventDefault();
    if (!formState) {
      return;
    }

    const trimmedName = formState.name.trim();
    const trimmedEmail = formState.email.trim();
    const completedDives = Number(formState.completedDives);
    if (!Number.isFinite(completedDives) || completedDives < 0) {
      setAlert(memberId, "error", "Tauchgänge müssen eine positive Zahl sein.");
      return;
    }

    if (trimmedName.length < 2) {
      setAlert(memberId, "error", "Name benötigt mindestens 2 Zeichen.");
      return;
    }

    if (trimmedEmail.length === 0) {
      setAlert(memberId, "error", "E-Mail darf nicht leer sein.");
      return;
    }

    const certifications = formState.certifications
      .split(",")
      .map((item) => item.trim())
      .filter((entry) => entry.length > 0);

    setSavingId(memberId);
    const result = await updateMember({
      id: memberId,
      data: {
        name: trimmedName,
        email: trimmedEmail,
        role: formState.role,
        city: formState.city.trim(),
        favoriteDiveSite: formState.favoriteDiveSite.trim(),
        about: formState.about.trim(),
        certifications,
        completedDives: Math.floor(completedDives)
      }
    });
    setSavingId(null);

    if (!result.success) {
      setAlert(memberId, "error", result.error ?? "Aktualisierung fehlgeschlagen.");
      return;
    }

    setAlert(memberId, "success", "Mitglied wurde aktualisiert.");
    cancelEditing();
  };

  const handlePasswordDraftChange = (memberId: string, value: string) => {
    setPasswordDrafts((previous) => ({ ...previous, [memberId]: value }));
  };

  const handlePasswordReset = async (memberId: string) => {
    const draft = (passwordDrafts[memberId] ?? "").trim();
    if (draft.length < 6) {
      setAlert(memberId, "error", "Passwort benötigt mindestens 6 Zeichen.");
      return;
    }

    setResettingId(memberId);
    const result = await resetMemberPassword({ id: memberId, newPassword: draft });
    setResettingId(null);

    if (!result.success) {
      setAlert(memberId, "error", result.error ?? "Passwort konnte nicht geändert werden.");
      return;
    }

    setPasswordDrafts((previous) => {
      const next = { ...previous };
      delete next[memberId];
      return next;
    });
    setAlert(memberId, "success", "Passwort wurde aktualisiert.");
  };

  const requestMemberDelete = (memberId: string) => {
    if (!canDeleteMember(memberId)) {
      return;
    }
    clearAlert(memberId);
    setPendingDeleteId(memberId);
  };

  const cancelMemberDelete = () => {
    setPendingDeleteId(null);
  };

  const confirmMemberDelete = async (memberId: string) => {
    if (!canDeleteMember(memberId)) {
      return;
    }

    setDeletingId(memberId);
    const result = await removeMember({ id: memberId });
    setDeletingId(null);

    if (!result.success) {
      setAlert(memberId, "error", result.error ?? "Mitglied konnte nicht entfernt werden.");
      setPendingDeleteId(memberId);
      return;
    }

    if (editingMemberId === memberId) {
      cancelEditing();
    }

    setPendingDeleteId(null);
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">Crew Übersicht</h2>
        <p className="text-sm text-slate-600">
          Alle registrierten Mitglieder der Demo inklusive Rolle, Wohnort und bevorzugter Spots.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((member) => (
          <article
            key={member.id}
            className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <MemberCardContent
              member={member}
              editingMemberId={editingMemberId}
              formState={formState}
              onStartEditing={startEditing}
              onCancelEditing={cancelEditing}
              onFormChange={handleFormChange}
              onSubmit={handleMemberSubmit}
              savingId={savingId}
              alerts={alerts}
              passwordDraft={passwordDrafts[member.id] ?? ""}
              onPasswordDraftChange={handlePasswordDraftChange}
              onPasswordReset={handlePasswordReset}
              resettingId={resettingId}
              canDelete={canDeleteMember(member.id)}
              isDeletePending={pendingDeleteId === member.id}
              onRequestDelete={requestMemberDelete}
              onCancelDelete={cancelMemberDelete}
              onConfirmDelete={confirmMemberDelete}
              isDeleting={deletingId === member.id}
            />
          </article>
        ))}
        {items.length === 0 && (
          <p className="col-span-full rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            Noch keine Mitglieder vorhanden. Lege über die Registrierung einen ersten Zugang an.
          </p>
        )}
      </div>
    </section>
  );
}

type MemberCardContentProps = {
  member: DirectoryMember;
  editingMemberId: string | null;
  formState: MemberFormState | null;
  onStartEditing: (memberId: string) => void;
  onCancelEditing: () => void;
  onFormChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>, memberId: string) => Promise<void>;
  savingId: string | null;
  alerts: AlertRecord;
  passwordDraft: string;
  onPasswordDraftChange: (memberId: string, value: string) => void;
  onPasswordReset: (memberId: string) => void;
  resettingId: string | null;
  canDelete: boolean;
  isDeletePending: boolean;
  onRequestDelete: (memberId: string) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (memberId: string) => Promise<void>;
  isDeleting: boolean;
};

function MemberCardContent({
  member,
  editingMemberId,
  formState,
  onStartEditing,
  onCancelEditing,
  onFormChange,
  onSubmit,
  savingId,
  alerts,
  passwordDraft,
  onPasswordDraftChange,
  onPasswordReset,
  resettingId,
  canDelete,
  isDeletePending,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
  isDeleting
}: MemberCardContentProps) {
  const isEditing = editingMemberId === member.id;
  const isSaving = savingId === member.id;
  const isResetting = resettingId === member.id;
  const alert = alerts[member.id];

  return (
    <div className="space-y-3">
      {isEditing ? (
        <form className="space-y-4" onSubmit={(event) => onSubmit(event, member.id)}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                Name
                <input
                  name="name"
                  value={formState?.name ?? member.name}
                  onChange={onFormChange}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                  required
                  minLength={2}
                />
              </label>
              <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                E-Mail
                <input
                  name="email"
                  type="email"
                  value={formState?.email ?? member.email}
                  onChange={onFormChange}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                  required
                />
              </label>
            </div>
            <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
              Rolle
              <select
                name="role"
                value={formState?.role ?? member.role}
                onChange={onFormChange}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              >
                <option value="member">Mitglied</option>
                <option value="admin">Administrator</option>
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
            Über dich
            <textarea
              name="about"
              value={formState?.about ?? member.about}
              onChange={onFormChange}
              className="min-h-[100px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
              Wohnort
              <input
                name="city"
                value={formState?.city ?? member.city}
                onChange={onFormChange}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
              Lieblingsplatz
              <input
                name="favoriteDiveSite"
                value={formState?.favoriteDiveSite ?? member.favoriteDiveSite}
                onChange={onFormChange}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
              Zertifizierungen
              <textarea
                name="certifications"
                value={formState?.certifications ?? member.certifications.join(", ")}
                onChange={onFormChange}
                className="min-h-[80px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                placeholder="Kommagetrennt, z. B. Rescue Diver, Nitrox"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
              Logbucheinträge
              <input
                name="completedDives"
                type="number"
                min={0}
                value={formState?.completedDives ?? String(member.completedDives)}
                onChange={onFormChange}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              />
            </label>
          </div>
          <p className="text-[11px] text-slate-500">Mitglied seit {formatDate(member.joinedAt)}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center rounded-xl bg-ocean-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-ocean-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Speichern..." : "Änderungen speichern"}
            </button>
            <button
              type="button"
              onClick={onCancelEditing}
              className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-400 hover:text-slate-700"
            >
              Abbrechen
            </button>
            {canDelete && (
              isDeletePending ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      void onConfirmDelete(member.id);
                    }}
                    disabled={isDeleting}
                    className="inline-flex items-center rounded-xl border border-rose-300 bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Löschen bestätigen
                  </button>
                  <button
                    type="button"
                    onClick={onCancelDelete}
                    className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-400 hover:text-slate-700"
                  >
                    Löschen abbrechen
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => onRequestDelete(member.id)}
                  disabled={isDeleting}
                  className="inline-flex items-center rounded-xl border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-700 shadow-sm transition hover:border-rose-300 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Mitglied löschen
                </button>
              )
            )}
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-slate-900">{member.name}</p>
              <p className="text-xs text-slate-500">{member.email}</p>
            </div>
            <span className="rounded-full bg-ocean-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-ocean-700">
              {roleLabel(member.role)}
            </span>
          </div>
          <p className="text-sm text-slate-600">{member.about}</p>
          <dl className="grid grid-cols-2 gap-2 text-xs text-slate-500">
            <div>
              <dt className="font-semibold text-slate-600">Wohnort</dt>
              <dd>{member.city || "Auf Reisen"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-600">Lieblingsplatz</dt>
              <dd>{member.favoriteDiveSite || "Noch nicht angegeben"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-600">Mitglied seit</dt>
              <dd>{formatDate(member.joinedAt)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-600">Logbuch</dt>
              <dd>{member.completedDives} Tauchgänge</dd>
            </div>
          </dl>
          {member.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {member.certifications.map((cert) => (
                <span
                  key={cert}
                  className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600"
                >
                  {cert}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onStartEditing(member.id)}
              className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-400 hover:text-slate-700"
            >
              Bearbeiten
            </button>
            {canDelete && (
              isDeletePending ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      void onConfirmDelete(member.id);
                    }}
                    disabled={isDeleting}
                    className="inline-flex items-center rounded-xl border border-rose-300 bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Löschen bestätigen
                  </button>
                  <button
                    type="button"
                    onClick={onCancelDelete}
                    className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-400 hover:text-slate-700"
                  >
                    Löschen abbrechen
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => onRequestDelete(member.id)}
                  disabled={isDeleting}
                  className="inline-flex items-center rounded-xl border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-700 shadow-sm transition hover:border-rose-300 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Mitglied löschen
                </button>
              )
            )}
          </div>
        </div>
      )}

      {alert && (
        <p
          className={`text-xs font-semibold ${
            alert.variant === "error" ? "text-rose-600" : "text-emerald-600"
          }`}
        >
          {alert.message}
        </p>
      )}

      <section className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <header className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>Passwort zurücksetzen</span>
          <span className="text-[11px] font-normal text-slate-400">Mindestens 6 Zeichen</span>
        </header>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="password"
            value={passwordDraft}
            onChange={(event) => onPasswordDraftChange(member.id, event.target.value)}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            placeholder="Neues Passwort"
          />
          <button
            type="button"
            onClick={() => onPasswordReset(member.id)}
            disabled={isResetting}
            className="inline-flex items-center justify-center rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isResetting ? "Aktualisiere..." : "Zurücksetzen"}
          </button>
        </div>
      </section>
    </div>
  );
}
