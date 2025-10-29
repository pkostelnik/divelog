"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/providers/auth-provider";
import { useI18n } from "@/providers/i18n-provider";
import { type SupportedLocale } from "@/i18n/translations";
import { useAccountActions } from "../hooks/use-account-actions";

const localeFormatMap: Record<SupportedLocale, string> = {
  de: "de-DE",
  en: "en-US"
};

function formatDate(value: string, locale: SupportedLocale) {
  return new Date(value).toLocaleDateString(localeFormatMap[locale], {
    dateStyle: "long"
  });
}

export function AccountOverview() {
  const { currentUser, loginAsDemoMember, logout, updateMember } = useAuth();
  const { resetPassword, deleteAccount } = useAccountActions();
  const { t, locale, setLocale, availableLocales } = useI18n();
  const router = useRouter();
  const [actionFeedback, setActionFeedback] = useState<{ variant: "success" | "error"; message: string } | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [selectedLocale, setSelectedLocale] = useState<SupportedLocale>(currentUser?.preferredLocale ?? locale);
  const [languageStatus, setLanguageStatus] = useState<"idle" | "saving">("idle");

  useEffect(() => {
    if (currentUser?.preferredLocale) {
      setSelectedLocale(currentUser.preferredLocale);
      return;
    }
    setSelectedLocale(locale);
  }, [currentUser?.preferredLocale, locale]);

  const handlePasswordReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) {
      return;
    }

    const trimmed = passwordInput.trim();
    if (trimmed.length < 6) {
      setActionFeedback({ variant: "error", message: t("auth.account.password.error.short") });
      return;
    }

    const result = await resetPassword({ memberId: currentUser.id, newPassword: trimmed });
    if (!result.success) {
      setActionFeedback({ variant: "error", message: result.error ?? t("auth.account.password.error.generic") });
      return;
    }
    setPasswordInput("");
    setShowPasswordForm(false);
    setActionFeedback({ variant: "success", message: t("auth.account.password.success") });
  };

  const handleAccountRemoval = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) {
      return;
    }

    if (deleteConfirmation.trim().toLowerCase() !== currentUser.email.toLowerCase()) {
      setActionFeedback({
        variant: "error",
        message: t("auth.account.delete.confirmationError")
      });
      return;
    }

    const result = await deleteAccount({
      memberId: currentUser.id,
      placeholderName: t("auth.account.delete.placeholderName")
    });
    if (!result.success) {
      setActionFeedback({ variant: "error", message: result.error ?? t("auth.account.delete.error") });
      return;
    }

    window.alert(t("auth.account.delete.successAlert"));
    setDeleteConfirmation("");
    setShowDeleteForm(false);
    logout();
    router.push("/auth/logout");
  };

  const handlePreferredLocaleChange = (nextLocale: SupportedLocale) => {
    setSelectedLocale(nextLocale);
    setActionFeedback(null);
  };

  const handleLanguageSave = async () => {
    if (!currentUser || selectedLocale === currentUser.preferredLocale) {
      return;
    }

    setActionFeedback(null);
    setLanguageStatus("saving");
    const result = await updateMember({
      id: currentUser.id,
      data: { preferredLocale: selectedLocale }
    });

    if (!result.success) {
      setLanguageStatus("idle");
      setActionFeedback({
        variant: "error",
        message: result.error ?? t("auth.account.language.error")
      });
      return;
    }

    setLanguageStatus("idle");
    setLocale(selectedLocale);
    setActionFeedback({ variant: "success", message: t("auth.account.language.success") });
  };

  const handleLogoutClick = () => {
    logout();
    router.push("/auth/logout");
  };

  if (!currentUser) {
    return (
      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">{t("auth.account.noUser.heading")}</h1>
        <p className="text-sm text-slate-600">{t("auth.account.noUser.description")}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/auth/login"
            className="rounded-xl bg-ocean-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-ocean-700"
          >
            {t("auth.account.noUser.login")}
          </Link>
          <Link
            href="/auth/register"
            className="rounded-xl border border-ocean-200 px-4 py-2 text-sm font-semibold text-ocean-700 shadow-sm transition hover:border-ocean-400 hover:text-ocean-800"
          >
            {t("auth.account.noUser.register")}
          </Link>
          <button
            type="button"
            onClick={() => loginAsDemoMember()}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-700"
          >
            {t("auth.account.noUser.demo")}
          </button>
        </div>
      </section>
    );
  }

  const greeting = t("auth.account.greeting").replace("{name}", currentUser.name);
  const passwordPlaceholder = currentUser.role === "admin"
    ? t("auth.account.password.placeholder.admin")
    : t("auth.account.password.placeholder.member");
  const deleteDescription = t("auth.account.delete.description");
  const [deleteBeforeEmail, deleteAfterEmail = ""] = deleteDescription.split("{email}");
  const hasLocaleChange = currentUser ? selectedLocale !== currentUser.preferredLocale : false;

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {greeting}
        </h1>
        <p className="text-sm text-slate-600">{t("auth.account.welcome")}</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{t("auth.account.section.profile")}</h2>
          <dl className="grid gap-3 md:grid-cols-2 text-sm text-slate-600">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("auth.account.field.role")}</dt>
              <dd>{currentUser.role === "admin" ? t("header.role.admin") : t("header.role.member")}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("auth.account.field.email")}</dt>
              <dd>{currentUser.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("auth.account.field.joined")}</dt>
              <dd>{formatDate(currentUser.joinedAt, locale)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("auth.account.field.city")}</dt>
              <dd>{currentUser.city || t("auth.account.field.empty")}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("auth.account.field.favorite")}</dt>
              <dd>{currentUser.favoriteDiveSite || t("auth.account.field.empty")}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("auth.account.field.dives")}</dt>
              <dd>{t("auth.account.field.dives.value").replace("{count}", currentUser.completedDives.toString())}</dd>
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
          <h2 className="text-lg font-semibold text-slate-900">{t("auth.account.section.actions")}</h2>
          <div className="space-y-3 text-sm text-slate-600">
            <p>{t("auth.account.actions.tip")}</p>
            <div className="flex flex-col gap-2">
              <Link
                href="/dashboard/community/blog"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-ocean-300 hover:text-ocean-700"
              >
                {t("auth.account.actions.blog")}
              </Link>
              <Link
                href="/dashboard/community/forum"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-ocean-300 hover:text-ocean-700"
              >
                {t("auth.account.actions.forum")}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setActionFeedback(null);
                  setShowPasswordForm((value) => !value);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-800"
              >
                {t("auth.account.actions.password")}
              </button>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="space-y-1">
                <label
                  htmlFor="preferred-locale"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {t("auth.account.language.heading")}
                </label>
                <p className="text-xs text-slate-500">{t("auth.account.language.description")}</p>
              </div>
              <select
                id="preferred-locale"
                value={selectedLocale}
                onChange={(event) => handlePreferredLocaleChange(event.target.value as SupportedLocale)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              >
                {availableLocales.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.flag} {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleLanguageSave}
                disabled={!hasLocaleChange || languageStatus === "saving"}
                className="w-full rounded-xl bg-ocean-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-ocean-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {languageStatus === "saving"
                  ? t("auth.account.language.saving")
                  : t("auth.account.language.save")}
              </button>
            </div>
            {showPasswordForm && (
              <form onSubmit={handlePasswordReset} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-600">{t("auth.account.password.description")}</p>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(event) => setPasswordInput(event.target.value)}
                  placeholder={passwordPlaceholder}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                />
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <button
                    type="submit"
                    className="rounded-xl bg-ocean-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-ocean-700"
                  >
                    {t("auth.account.password.submit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordInput("");
                      setShowPasswordForm(false);
                    }}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-800"
                  >
                    {t("auth.account.actions.cancel")}
                  </button>
                </div>
              </form>
            )}
            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
            >
              {t("header.auth.logout")}
            </button>
            <button
              type="button"
              onClick={() => {
                setActionFeedback(null);
                setShowDeleteForm((value) => !value);
              }}
              className="w-full rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-400 hover:bg-rose-100"
            >
              {t("auth.account.delete.toggle")}
            </button>
            {showDeleteForm && currentUser && (
              <form
                onSubmit={handleAccountRemoval}
                className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4"
              >
                <p className="text-xs font-medium text-rose-700">
                  {deleteBeforeEmail}
                  <span className="font-semibold">{currentUser.email}</span>
                  {deleteAfterEmail}
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
                    {t("auth.account.delete.confirm")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmation("");
                      setShowDeleteForm(false);
                    }}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-800"
                  >
                    {t("auth.account.actions.cancel")}
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
