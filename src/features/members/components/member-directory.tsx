"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";

import type { MemberProfile, MemberRole } from "@/data/mock-data";
import { useAuth } from "@/providers/auth-provider";
import { useI18n } from "@/providers/i18n-provider";

function formatDate(value: string, locale: string) {
  return new Date(value).toLocaleDateString(locale === "de" ? "de-DE" : "en-US", {
    year: "numeric",
    month: "short"
  });
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
  const { t, locale } = useI18n();
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
      setAlert(memberId, "error", "Dives must be a positive number.");
      return;
    }

    if (trimmedName.length < 2) {
      setAlert(memberId, "error", "Name requires at least 2 characters.");
      return;
    }

    if (trimmedEmail.length === 0) {
      setAlert(memberId, "error", "Email cannot be empty.");
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
      setAlert(memberId, "error", result.error ?? "Update failed.");
      return;
    }

    setAlert(memberId, "success", "Member has been updated.");
    cancelEditing();
  };

  const handlePasswordDraftChange = (memberId: string, value: string) => {
    setPasswordDrafts((previous) => ({ ...previous, [memberId]: value }));
  };

  const handlePasswordReset = async (memberId: string) => {
    const draft = (passwordDrafts[memberId] ?? "").trim();
    if (draft.length < 6) {
      setAlert(memberId, "error", t("dashboard.members.password.hint"));
      return;
    }

    setResettingId(memberId);
    const result = await resetMemberPassword({ id: memberId, newPassword: draft });
    setResettingId(null);

    if (!result.success) {
      setAlert(memberId, "error", result.error ?? "Could not update member.");
      return;
    }

    setPasswordDrafts((previous) => {
      const next = { ...previous };
      delete next[memberId];
      return next;
    });
    setAlert(memberId, "success", t("dashboard.members.password.success"));
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
      setAlert(memberId, "error", result.error ?? "Could not remove member.");
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
        <h2 className="text-lg font-semibold text-slate-900">{t("dashboard.members.directory.heading")}</h2>
        <p className="text-sm text-slate-600">
          {t("dashboard.members.directory.description")}
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
              t={t}
              locale={locale}
            />
          </article>
        ))}
        {items.length === 0 && (
          <p className="col-span-full rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            {t("dashboard.members.directory.empty")}
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
  t: (key: string, defaultValue?: string) => string;
  locale: string;
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
  isDeleting,
  t,
  locale
}: MemberCardContentProps) {
  const isEditing = editingMemberId === member.id;
  const isSaving = savingId === member.id;
  const isResetting = resettingId === member.id;
  const alert = alerts[member.id];

  const roleLabel = (role: string) => {
    return role === "admin" 
      ? t("dashboard.members.card.role.admin") 
      : t("dashboard.members.card.role.member");
  };

  return (
    <div className="space-y-3">
      {isEditing ? (
        <form className="space-y-4" onSubmit={(event) => onSubmit(event, member.id)}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                {t("dashboard.members.form.field.name")}
                <input
                  name="name"
                  value={formState?.name ?? member.name}
                  onChange={onFormChange}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                  required
                  minLength={2}
                />
              </label>
              <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                {t("dashboard.members.form.field.email")}
                <input
                  name="email"
                  type="email"
                  value={formState?.email ?? member.email}
                  onChange={onFormChange}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                  required
                />
              </label>
            </div>
            <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
              {t("dashboard.members.form.field.role")}
              <select
                name="role"
                value={formState?.role ?? member.role}
                onChange={onFormChange}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              >
                <option value="member">{t("dashboard.members.form.field.role.member")}</option>
                <option value="admin">{t("dashboard.members.form.field.role.admin")}</option>
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
            {t("dashboard.members.form.field.about")}
            <textarea
              name="about"
              value={formState?.about ?? member.about}
              onChange={onFormChange}
              className="min-h-[100px] rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
              {t("dashboard.members.form.field.city")}
              <input
                name="city"
                value={formState?.city ?? member.city}
                onChange={onFormChange}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
              {t("dashboard.members.form.field.favoriteSite")}
              <input
                name="favoriteDiveSite"
                value={formState?.favoriteDiveSite ?? member.favoriteDiveSite}
                onChange={onFormChange}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
              {t("dashboard.members.form.field.certifications")}
              <textarea
                name="certifications"
                value={formState?.certifications ?? member.certifications.join(", ")}
                onChange={onFormChange}
                className="min-h-[80px] rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                placeholder={t("dashboard.members.form.field.certifications.placeholder")}
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
              {t("dashboard.members.form.field.completedDives")}
              <input
                name="completedDives"
                type="number"
                min={0}
                value={formState?.completedDives ?? String(member.completedDives)}
                onChange={onFormChange}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              />
            </label>
          </div>
          <p className="text-[11px] text-slate-500">{t("dashboard.members.card.field.memberSince")} {formatDate(member.joinedAt, locale)}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center rounded-xl bg-ocean-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-ocean-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? t("dashboard.members.form.actions.saving") : t("dashboard.members.form.actions.save")}
            </button>
            <button
              type="button"
              onClick={onCancelEditing}
              className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-400 hover:text-slate-700"
            >
              {t("dashboard.members.form.actions.cancel")}
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
                    className="inline-flex items-center rounded-xl border border-rose-300 bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {t("dashboard.members.card.actions.deleteConfirm")}
                  </button>
                  <button
                    type="button"
                    onClick={onCancelDelete}
                    className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-400 hover:text-slate-700"
                  >
                    {t("dashboard.members.card.actions.deleteCancel")}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => onRequestDelete(member.id)}
                  disabled={isDeleting}
                  className="inline-flex items-center rounded-xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700 shadow-sm transition hover:border-rose-300 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t("dashboard.members.card.actions.delete")}
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
              <dt className="font-semibold text-slate-600">{t("dashboard.members.form.field.city")}</dt>
              <dd>{member.city || t("dashboard.members.card.field.cityFallback")}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-600">{t("dashboard.members.form.field.favoriteSite")}</dt>
              <dd>{member.favoriteDiveSite || t("dashboard.members.card.field.siteNotSpecified")}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-600">{t("dashboard.members.card.field.memberSince")}</dt>
              <dd>{formatDate(member.joinedAt, locale)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-600">{t("dashboard.members.card.field.logbook")}</dt>
              <dd>{member.completedDives} {t("dashboard.members.card.field.dives")}</dd>
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
              className="inline-flex items-center rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-400 hover:text-slate-700"
            >
              {t("dashboard.members.card.actions.edit")}
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
                    className="inline-flex items-center rounded-xl border border-rose-300 bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {t("dashboard.members.card.actions.deleteConfirm")}
                  </button>
                  <button
                    type="button"
                    onClick={onCancelDelete}
                    className="inline-flex items-center rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-400 hover:text-slate-700"
                  >
                    {t("dashboard.members.card.actions.deleteCancel")}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => onRequestDelete(member.id)}
                  disabled={isDeleting}
                  className="inline-flex items-center rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 shadow-sm transition hover:border-rose-300 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t("dashboard.members.card.actions.delete")}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {alert && (
        <p
          role="alert"
          className={`text-xs font-semibold ${
            alert.variant === "error" ? "text-rose-600" : "text-emerald-600"
          }`}
        >
          {alert.message}
        </p>
      )}

      <section className="rounded-2xl border border-slate-100 bg-slate-50 p-4" aria-labelledby={`password-heading-${member.id}`}>
        <header className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span id={`password-heading-${member.id}`}>{t("dashboard.members.password.heading")}</span>
          <span id={`password-hint-${member.id}`} className="text-[11px] font-normal text-slate-400">{t("dashboard.members.password.hint")}</span>
        </header>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor={`password-${member.id}`}>
            {t("dashboard.members.password.placeholder")}
          </label>
          <input
            id={`password-${member.id}`}
            type="password"
            value={passwordDraft}
            onChange={(event) => onPasswordDraftChange(member.id, event.target.value)}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            placeholder={t("dashboard.members.password.placeholder")}
            aria-describedby={`password-hint-${member.id}`}
          />
          <button
            type="button"
            onClick={() => onPasswordReset(member.id)}
            disabled={isResetting}
            className="inline-flex items-center justify-center rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60 sm:whitespace-nowrap"
          >
            {isResetting ? t("dashboard.members.password.resetting") : t("dashboard.members.password.button")}
          </button>
        </div>
      </section>
    </div>
  );
}
