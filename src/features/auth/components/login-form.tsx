"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/providers/auth-provider";

export function LoginForm() {
  const router = useRouter();
  const { login, loginAsDemoMember, loginAsDemoAdmin, currentUser } = useAuth();
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
      setError(result.error ?? "Anmeldung fehlgeschlagen.");
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
      setError(result.error ?? "Demoanmeldung fehlgeschlagen.");
      return;
    }
    setError(null);
    router.push("/dashboard/profile");
  };

  if (currentUser) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Bereits angemeldet</h2>
        <p className="mt-2 text-sm text-slate-600">
          Du bist aktuell als {currentUser.name} angemeldet. Wechsle zum persönlichen Bereich oder melde dich ab, um einen anderen Zugang zu testen.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-4 space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">Anmeldung</h1>
        <p className="text-sm text-slate-600">
          Verwende deine Zugangsdaten oder nutze einen der Demo-Zugänge.
        </p>
      </header>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
          E-Mail
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="du@beispiel.de"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
          Passwort
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            required
          />
        </label>
        {error && (
          <p className="text-sm font-medium text-rose-600">{error}</p>
        )}
        <button
          type="submit"
          className="w-full rounded-xl bg-ocean-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-ocean-700 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Wird angemeldet..." : "Anmelden"}
        </button>
      </form>
      <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Demo-Zugänge
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => handleDemoLogin("member")}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-ocean-700 shadow-sm transition hover:border-ocean-400 hover:text-ocean-800"
          >
            Als Mitglied testen
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin("admin")}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-ocean-700 shadow-sm transition hover:border-ocean-400 hover:text-ocean-800"
          >
            Als Administrator testen
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Zugangsdaten werden beim Abmelden wieder vergessen. Perfekt, um Features kurz auszuprobieren.
        </p>
      </div>
    </section>
  );
}
