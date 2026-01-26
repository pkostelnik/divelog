"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/providers/auth-provider";
import { useI18n } from "@/providers/i18n-provider";
import { type SupportedLocale } from "@/i18n/translations";
import { socialProviders, type SocialProviderId } from "./social-providers";

type RegisterFormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  city: string;
  favoriteDiveSite: string;
  preferredLocale: SupportedLocale;
};

export function RegisterForm() {
  const router = useRouter();
  const { register, currentUser } = useAuth();
  const { t, availableLocales, locale } = useI18n();
  const [form, setForm] = useState<RegisterFormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    city: "",
    favoriteDiveSite: "",
    preferredLocale: locale
  });
  const [error, setError] = useState<string | null>(null);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting">("idle");

  const handleChange = (field: Exclude<keyof RegisterFormState, "preferredLocale">) => (value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));
    setError(null);

    if (field === "confirmPassword") {
      setPasswordMismatch(value !== form.password);
    }
    if (field === "password") {
      setPasswordMismatch(form.confirmPassword !== value && form.confirmPassword.length > 0);
    }
  };

  const handleLocaleChange = (nextLocale: SupportedLocale) => {
    setForm((previous) => ({
      ...previous,
      preferredLocale: nextLocale
    }));
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") {
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError(t("auth.register.passwordConfirm.error"));
      return;
    }

    setStatus("submitting");
    const result = await register({
      name: form.name,
      email: form.email,
      password: form.password,
      city: form.city,
      favoriteDiveSite: form.favoriteDiveSite,
      preferredLocale: form.preferredLocale
    });

    if (!result.success) {
      setError(result.error ?? t("auth.register.error.generic"));
      setStatus("idle");
      return;
    }

    setError(null);
    setStatus("idle");
    router.push("/dashboard/profile");
  };

  const handleSocialRegister = (providerId: SocialProviderId) => {
    const next = new URLSearchParams({ provider: providerId });
    router.push(`/auth/login?${next.toString()}`);
  };

  if (currentUser) {
    const message = t("auth.register.already.description").replace("{name}", currentUser.name);
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{t("auth.register.already.title")}</h2>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-4 space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">{t("auth.register.heading")}</h1>
        <p className="text-sm text-slate-700">{t("auth.register.subtitle")}</p>
      </header>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
            {t("auth.register.name.label")}
            <input
              value={form.name}
              onChange={(event) => handleChange("name")(event.target.value)}
              placeholder={t("auth.register.name.placeholder")}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
            {t("auth.register.city.label")}
            <input
              value={form.city}
              onChange={(event) => handleChange("city")(event.target.value)}
              placeholder={t("auth.register.city.placeholder")}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
          </label>
        </div>
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
          {t("auth.register.locale.label")}
          <select
            value={form.preferredLocale}
            onChange={(event) => handleLocaleChange(event.target.value as SupportedLocale)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
          >
            {availableLocales.map((option) => (
              <option key={option.value} value={option.value}>
                {option.flag} {option.label}
              </option>
            ))}
          </select>
          <span className="text-[11px] font-normal text-slate-500">
            {t("auth.register.locale.helper")}
          </span>
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
          {t("auth.register.email.label")}
          <input
            type="email"
            value={form.email}
            onChange={(event) => handleChange("email")(event.target.value)}
            placeholder={t("auth.register.email.placeholder")}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
          {t("auth.register.password.label")}
          <input
            type="password"
            value={form.password}
            onChange={(event) => handleChange("password")(event.target.value)}
            placeholder={t("auth.register.password.placeholder")}
            minLength={6}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
          {t("auth.register.passwordConfirm.label")}
          <input
            type="password"
            id="register-confirm-password"
            value={form.confirmPassword}
            onChange={(event) => handleChange("confirmPassword")(event.target.value)}
            placeholder={t("auth.register.passwordConfirm.placeholder")}
            minLength={6}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            required
            aria-invalid={passwordMismatch}
            aria-describedby={passwordMismatch ? "password-confirm-error" : undefined}
          />
          {passwordMismatch && (
            <span id="password-confirm-error" role="alert" className="text-xs font-normal text-rose-600">
              {t("auth.register.passwordConfirm.error")}
            </span>
          )}
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
          {t("auth.register.favoriteSite.label")}
          <input
            value={form.favoriteDiveSite}
            onChange={(event) => handleChange("favoriteDiveSite")(event.target.value)}
            placeholder={t("auth.register.favoriteSite.placeholder")}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
          />
        </label>
        {error && <p id="register-error" role="alert" className="text-sm font-medium text-rose-600">{error}</p>}
        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="submit"
            className="rounded-xl bg-ocean-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-ocean-700 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={status === "submitting" || passwordMismatch}
          >
            {status === "submitting" ? t("auth.register.submit.progress") : t("auth.register.submit.idle")}
          </button>
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:text-slate-900"
          >
            {t("auth.register.cancel")}
          </button>
        </div>
      </form>
      <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("auth.register.social.heading")}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {socialProviders.map((provider, index) => {
            const Icon = provider.Icon;
            return (
              <button
                key={provider.id}
                type="button"
                onClick={() => handleSocialRegister(provider.id)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 ${index === socialProviders.length - 1 ? "sm:col-span-2" : ""}`}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span>{provider.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-slate-500">
          {t("auth.register.social.description")}
        </p>
      </div>
    </section>
  );
}
