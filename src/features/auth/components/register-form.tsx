"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/providers/auth-provider";

export function RegisterForm() {
  const router = useRouter();
  const { register, currentUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    city: "",
    favoriteDiveSite: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting">("idle");

  const handleChange = (field: keyof typeof form) => (value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") {
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
        <p className="text-sm text-slate-600">
          Erstelle einen kostenlosen Demo-Zugang und sichere dir Zugriff auf Mitgliederfunktionen.
        </p>
      </header>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
            Name
            <input
              value={form.name}
              onChange={(event) => handleChange("name")(event.target.value)}
              placeholder="Vor- und Nachname"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
            Wohnort
            <input
              value={form.city}
              onChange={(event) => handleChange("city")(event.target.value)}
              placeholder="Wo bist du zuhause?"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
          </label>
        </div>
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
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
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
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
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
          Lieblingstauchplatz (optional)
          <input
            value={form.favoriteDiveSite}
            onChange={(event) => handleChange("favoriteDiveSite")(event.target.value)}
            placeholder="z. B. Shark Point, Thailand"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
          />
        </label>
        {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-xl bg-ocean-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-ocean-700 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Wird erstellt..." : "Zugang anlegen"}
        </button>
      </form>
    </section>
  );
}
