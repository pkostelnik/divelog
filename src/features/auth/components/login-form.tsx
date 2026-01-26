"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/providers/auth-provider";
import { useI18n } from "@/providers/i18n-provider";
import { type SupportedLocale } from "@/i18n/translations";
import { socialProviders, type SocialProviderId } from "./social-providers";

export function LoginForm() {
  const router = useRouter();
  const { login, loginAsDemoMember, loginAsDemoAdmin, loginAsDemoLocale, currentUser } = useAuth();
  const { t, availableLocales } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting">("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") {
      return;
    }

    setStatus("submitting");
    const result = await login({ email, password });

    if (!result.success) {
      setError(result.error ?? t("auth.login.error.generic"));
      setStatus("idle");
      return;
    }

    setError(null);
    setStatus("idle");
    router.push("/dashboard/profile");
  };

  const handleDemoLogin = async (mode: "member" | "admin") => {
    const handler = mode === "member" ? loginAsDemoMember : loginAsDemoAdmin;
    const result = await handler();
    if (!result.success) {
      setError(result.error ?? t("auth.login.error.demo"));
      return;
    }
    setError(null);
    router.push("/dashboard/profile");
  };

  const handleSocialLogin = async (providerId: SocialProviderId) => {
    const mode = providerId === "linkedin" ? "admin" : "member";
    await handleDemoLogin(mode);
  };

  const handleLocaleDemoLogin = async (preferredLocale: SupportedLocale) => {
    const result = await loginAsDemoLocale(preferredLocale);
    if (!result.success) {
      setError(result.error ?? t("auth.login.error.demo"));
      return;
    }
    setError(null);
    router.push("/dashboard/profile");
  };

  if (currentUser) {
    const message = t("auth.login.already.description").replace("{name}", currentUser.name);
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{t("auth.login.already.title")}</h2>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-4 space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">{t("auth.login.heading")}</h1>
        <p className="text-sm text-slate-700">{t("auth.login.subtitle")}</p>
      </header>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
          {t("auth.login.email.label")}
          <input
            type="email"
            id="login-email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("auth.login.email.placeholder")}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            required
            aria-describedby={error ? "login-error" : undefined}
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
          {t("auth.login.password.label")}
          <input
            type="password"
            id="login-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t("auth.login.password.placeholder")}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            required
            aria-describedby={error ? "login-error" : undefined}
          />
        </label>
        <div role="alert" aria-live="polite" aria-atomic="true">
          {error && (
            <p id="login-error" className="text-sm font-medium text-rose-600">{error}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-ocean-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-ocean-700 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? t("auth.login.submit.progress") : t("auth.login.submit.idle")}
        </button>
      </form>
      <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("auth.login.demo.heading")}
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => handleDemoLogin("member")}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-ocean-700 shadow-sm transition hover:border-ocean-400 hover:text-ocean-800"
          >
            {t("auth.login.demo.member")}
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin("admin")}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-ocean-700 shadow-sm transition hover:border-ocean-400 hover:text-ocean-800"
          >
            {t("auth.login.demo.admin")}
          </button>
        </div>
        <p className="text-xs text-slate-600">
          {t("auth.login.demo.description")}
        </p>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            {t("auth.login.demo.locale.title")}
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {availableLocales.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleLocaleDemoLogin(option.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-ocean-700 shadow-sm transition hover:border-ocean-400 hover:text-ocean-800"
              >
                {t("auth.login.demo.locale.option").replace("{label}", option.label)}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-600">
            {t("auth.login.demo.locale.helper")}
          </p>
        </div>
      </div>
      <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("auth.login.social.heading")}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {socialProviders.map((provider, index) => {
            const Icon = provider.Icon;
            return (
              <button
                key={provider.id}
                type="button"
                onClick={() => handleSocialLogin(provider.id)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 ${index === socialProviders.length - 1 ? "sm:col-span-2" : ""}`}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span>{provider.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-slate-500">
          {t("auth.login.social.description")}
        </p>
      </div>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-700">
        <p className="mb-3">{t("auth.login.register.cta")}</p>
        <Link
          href="/auth/register"
          className="inline-flex items-center justify-center rounded-xl bg-ocean-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-ocean-700"
        >
          {t("auth.login.register.button")}
        </Link>
      </div>
    </section>
  );
}
