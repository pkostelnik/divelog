"use client";

import { useEffect, useId, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { z } from "zod";

import type { DiveLogPreview } from "@/data/mock-data";
import { useDemoData } from "@/providers/demo-data-provider";
import { useAuth } from "@/providers/auth-provider";

const difficulties = ["Beginner", "Fortgeschritten", "Pro"] as const;

type DifficultyOption = (typeof difficulties)[number];

const formSchema = z.object({
  title: z.string().min(3, "Titel muss mindestens 3 Zeichen besitzen."),
  location: z.string().min(2, "Bitte einen Ort angeben."),
  date: z.string().min(1, "Datum auswählen."),
  depth: z.coerce.number().min(1).max(120),
  duration: z.coerce.number().min(1).max(240),
  buddy: z.string().min(2, "Buddy eintragen."),
  difficulty: z.enum(difficulties),
  diverId: z.string().min(1, "Bitte eine Taucherin oder einen Taucher auswählen."),
  siteId: z.string().optional().nullable()
});

type FormInput = z.infer<typeof formSchema>;

type FormErrors = Partial<Record<keyof FormInput, string>>;

function createInitialForm(initialValue?: DiveLogPreview | null, fallbackDiverId?: string | null): FormInput {
  if (initialValue) {
    const { title, location, date, depth, duration, buddy, difficulty, diverId, siteId } = initialValue;
    return {
      title,
      location,
      date,
      depth,
      duration,
      buddy,
      difficulty,
      diverId: diverId ?? fallbackDiverId ?? "",
      siteId: siteId ?? ""
    };
  }
  return {
    title: "",
    location: "",
    date: new Date().toISOString().slice(0, 10),
    depth: 18,
    duration: 45,
    buddy: "",
    difficulty: "Beginner",
    diverId: fallbackDiverId ?? "",
    siteId: ""
  };
}

type AddDiveLogFormProps = {
  initialValue?: DiveLogPreview | null;
  onSubmitSuccess?: () => void;
  onCancelEdit?: () => void;
};

export function AddDiveLogForm({ initialValue, onSubmitSuccess, onCancelEdit }: AddDiveLogFormProps) {
  const { addDiveLog, updateDiveLog, diveSites } = useDemoData();
  const { members, currentUser } = useAuth();
  const fallbackDiverId = currentUser?.id ?? "";
  const [form, setForm] = useState<FormInput>(() => createInitialForm(initialValue, fallbackDiverId));
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const isEditing = Boolean(initialValue);
  const siteListId = useId();

  const hasErrors = useMemo(() => Object.values(errors).some(Boolean), [errors]);

  const memberOptions = useMemo(() => {
    return [...members]
      .map((member) => ({ id: member.id, label: member.name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [members]);

  const siteOptions = useMemo(() => {
    return [...diveSites]
      .map((site) => ({
        id: site.id,
        label: `${site.name} (${site.country})`,
        value: site.name
      }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [diveSites]);

  useEffect(() => {
    setForm(createInitialForm(initialValue, fallbackDiverId));
    setErrors({});
    setStatus("idle");
  }, [initialValue, fallbackDiverId]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    const key = name as keyof FormInput;
    setForm((previous) => ({
      ...previous,
      [name]: name === "depth" || name === "duration" ? Number(value) : value
    }));
    setErrors((previous) => {
      if (!(key in previous)) {
        return previous;
      }
      const { [key]: _removed, ...rest } = previous;
      return rest;
    });
    setStatus("idle");
  };

  const handlePresetSelect = (location: string) => {
    const matched = siteOptions.find((option) => option.value === location);
    setForm((previous) => ({
      ...previous,
      location,
      siteId: matched?.id ?? previous.siteId
    }));
    setErrors((previous) => {
      if (!previous.location) {
        return previous;
      }
      const { location: _removed, ...rest } = previous;
      return rest;
    });
    setStatus("idle");
  };

  const handleSiteSelect = (siteId: string) => {
    const matched = diveSites.find((site) => site.id === siteId);
    setForm((previous) => ({
      ...previous,
      siteId,
      location: matched ? matched.name : previous.location
    }));
    setErrors((previous) => {
      if (!previous.location) {
        return previous;
      }
      const { location: _removed, ...rest } = previous;
      return rest;
    });
    setStatus("idle");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = formSchema.safeParse(form);

    if (!result.success) {
      const nextErrors: FormErrors = {};
      const flattened = result.error.flatten().fieldErrors;
      (Object.keys(flattened) as Array<keyof FormInput>).forEach((key) => {
        const message = flattened[key]?.[0];
        if (message) {
          nextErrors[key] = message;
        }
      });
      setErrors(nextErrors);
      setStatus("idle");
      return;
    }

    const normalizedPayload = {
      ...result.data,
      siteId: result.data.siteId || undefined
    } satisfies Omit<DiveLogPreview, "id">;

    if (isEditing && initialValue) {
      updateDiveLog(initialValue.id, normalizedPayload);
    } else {
      addDiveLog(normalizedPayload);
    }

    setForm(createInitialForm(isEditing ? initialValue : undefined, fallbackDiverId));
    setErrors({});
    setStatus("success");
    onSubmitSuccess?.();
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
      <header className="mb-4 space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">
          {isEditing ? "Logbuch-Eintrag bearbeiten" : "Logbuch-Eintrag erfassen"}
        </h2>
        <p className="text-xs text-slate-500">
          Die Daten bleiben lokal im Speicher dieser Sitzung - ideal für Demos oder Usability-Tests.
        </p>
      </header>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
            Titel
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Riff, Wrack oder Erlebnis"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
            {errors.title && <span className="text-xs font-normal text-rose-600">{errors.title}</span>}
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
            Log gehört zu
            <select
              name="diverId"
              value={form.diverId}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            >
              <option value="" disabled>
                Mitglied auswählen
              </option>
              {memberOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.diverId && <span className="text-xs font-normal text-rose-600">{errors.diverId}</span>}
          </label>
        </div>
        <div className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
          <label className="flex flex-col gap-2">
            Spot / Ort
            <input
              name="location"
              list={siteListId}
              value={form.location}
              onChange={handleChange}
              placeholder="Tauchplatz auswählen oder frei eingeben"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
          </label>
          {errors.location && (
            <span className="text-xs font-normal text-rose-600">{errors.location}</span>
          )}
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
            Verknüpfter Spot
            <select
              name="siteId"
              value={form.siteId ?? ""}
              onChange={(event) => handleSiteSelect(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            >
              <option value="">Kein verknüpfter Spot</option>
              {siteOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {siteOptions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-normal text-slate-500">
              <span>Vorschläge:</span>
              <div className="flex flex-wrap gap-2">
                {siteOptions.slice(0, 4).map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handlePresetSelect(option.value)}
                    className={`rounded-full border px-3 py-1 transition ${
                      form.location === option.value
                        ? "border-ocean-300 bg-ocean-50 text-ocean-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-ocean-200 hover:text-ocean-700"
                    }`}
                  >
                    {option.value}
                  </button>
                ))}
                {siteOptions.length > 4 && (
                  <span className="text-slate-400">
                    und {siteOptions.length - 4} weitere per Eingabe oder Suche
                  </span>
                )}
              </div>
            </div>
          )}
          <datalist id={siteListId}>
            {siteOptions.map((option) => (
              <option key={option.id} value={option.value} label={option.label} />
            ))}
          </datalist>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
            Datum
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
            {errors.date && <span className="text-xs font-normal text-rose-600">{errors.date}</span>}
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
            Tiefe (m)
            <input
              type="number"
              min={1}
              max={120}
              name="depth"
              value={form.depth}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
            {errors.depth && <span className="text-xs font-normal text-rose-600">{errors.depth}</span>}
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
            Dauer (min)
            <input
              type="number"
              min={1}
              max={240}
              name="duration"
              value={form.duration}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
            {errors.duration && (
              <span className="text-xs font-normal text-rose-600">{errors.duration}</span>
            )}
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
            Buddy
            <input
              name="buddy"
              value={form.buddy}
              onChange={handleChange}
              placeholder="Vor- und Nachname"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
            {errors.buddy && <span className="text-xs font-normal text-rose-600">{errors.buddy}</span>}
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
            Schwierigkeitsgrad
            <select
              name="difficulty"
              value={form.difficulty}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            >
              {difficulties.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.difficulty && (
              <span className="text-xs font-normal text-rose-600">{errors.difficulty}</span>
            )}
          </label>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="w-full rounded-xl bg-ocean-600 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-ocean-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500"
          >
            {isEditing ? "Änderungen speichern" : "Eintrag speichern"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-400 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            >
              Bearbeitung abbrechen
            </button>
          )}
        </div>
        {status === "success" && !hasErrors && (
          <p className="text-xs font-semibold text-emerald-600">
            Eintrag gespeichert - der Log taucht nun in allen Listen auf.
          </p>
        )}
      </form>
    </section>
  );
}
