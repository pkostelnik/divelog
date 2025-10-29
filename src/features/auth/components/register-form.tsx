"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/providers/auth-provider";
import { socialProviders, type SocialProviderId } from "./social-providers";

export function RegisterForm() {
  const router = useRouter();
  const { register, currentUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    city: "",
    favoriteDiveSite: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting">("idle");

  const handleChange = (field: keyof typeof form) => (value: string) => {
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") {
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }

    setStatus("submitting");
    const result = await register({
      name: form.name,
      email: form.email,
      password: form.password,
      city: form.city,
      favoriteDiveSite: form.favoriteDiveSite
    });

    if (!result.success) {
      setError(result.error ?? "Registrierung fehlgeschlagen.");
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
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Bereits angemeldet</h2>
        <p className="mt-2 text-sm text-slate-600">
          Du bist aktuell als {currentUser.name} angemeldet. Besuche deine persönliche Seite oder melde dich ab, um einen neuen Account anzulegen.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-4 space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">Registrierung</h1>
        <p className="text-sm text-slate-700">
          Erstelle einen kostenlosen Demo-Zugang und sichere dir Zugriff auf Mitgliederfunktionen.
        </p>
      </header>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
            Name
            <input
              value={form.name}
              onChange={(event) => handleChange("name")(event.target.value)}
              placeholder="Vor- und Nachname"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
            Wohnort
            <input
              value={form.city}
              onChange={(event) => handleChange("city")(event.target.value)}
              placeholder="Wo bist du zuhause?"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
          </label>
        </div>
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
          E-Mail
          <input
            type="email"
            value={form.email}
            onChange={(event) => handleChange("email")(event.target.value)}
            placeholder="du@beispiel.de"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
          Passwort
          <input
            type="password"
            value={form.password}
            onChange={(event) => handleChange("password")(event.target.value)}
            placeholder="Mindestens 6 Zeichen"
            minLength={6}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
          Passwort bestätigen
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(event) => handleChange("confirmPassword")(event.target.value)}
            placeholder="Passwort erneut eingeben"
            minLength={6}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            required
          />
          {passwordMismatch && (
            <span className="text-xs font-normal text-rose-600">
              Eingabe stimmt nicht mit dem Passwort überein.
            </span>
          )}
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
          Lieblingstauchplatz (optional)
          <input
            value={form.favoriteDiveSite}
            onChange={(event) => handleChange("favoriteDiveSite")(event.target.value)}
            placeholder="z. B. Shark Point, Thailand"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
          />
        </label>
        {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="submit"
            className="rounded-xl bg-ocean-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-ocean-700 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={status === "submitting" || passwordMismatch}
          >
            {status === "submitting" ? "Wird erstellt..." : "Zugang anlegen"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:text-slate-900"
          >
            Abbrechen
          </button>
        </div>
      </form>
      <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Schnell registrieren
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
          Diese Demo leitet Social-Registrierungen zum Login weiter. Echte OAuth-Flows können später ergänzt werden.
        </p>
      </div>
    </section>
  );
}
