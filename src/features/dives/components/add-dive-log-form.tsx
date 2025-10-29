"use client";

import { useCallback, useEffect, useId, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { z } from "zod";

import type { DiveLogPreview } from "@/data/mock-data";
import { useDemoData } from "@/providers/demo-data-provider";
import { useAuth } from "@/providers/auth-provider";
import { useI18n } from "@/providers/i18n-provider";

const difficulties = ["Beginner", "Fortgeschritten", "Pro"] as const;

type DifficultyOption = (typeof difficulties)[number];

function createFormSchema(t: (key: string) => string) {
  return z.object({
    title: z.string().min(3, t("dashboard.dives.form.errors.title.min")),
    location: z.string().min(2, t("dashboard.dives.form.errors.location.min")),
    date: z.string().min(1, t("dashboard.dives.form.errors.date.required")),
    depth: z.coerce.number().min(1, t("dashboard.dives.form.errors.depth.min")).max(120, t("dashboard.dives.form.errors.depth.max")),
    duration: z.coerce.number().min(1, t("dashboard.dives.form.errors.duration.min")).max(240, t("dashboard.dives.form.errors.duration.max")),
    buddy: z.string().min(2, t("dashboard.dives.form.errors.buddy.min")),
    difficulty: z.enum(difficulties),
    diverId: z.string().min(1, t("dashboard.dives.form.errors.diver.required")),
    logNumber: z.coerce.number().min(1, t("dashboard.dives.form.errors.logNumber.min")),
    siteId: z.string().optional().nullable()
  });
}

type FormSchema = ReturnType<typeof createFormSchema>;

type FormInput = z.infer<FormSchema>;

type FormErrors = Partial<Record<keyof FormInput, string>>;

function createInitialForm(initialValue?: DiveLogPreview | null, fallbackDiverId?: string | null): FormInput {
  if (initialValue) {
    const { title, location, date, depth, duration, buddy, difficulty, diverId, siteId, logNumber } = initialValue;
    return {
      title,
      location,
      date,
      depth,
      duration,
      buddy,
      difficulty,
      diverId: diverId ?? fallbackDiverId ?? "",
      logNumber,
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
    logNumber: 1,
    siteId: ""
  };
}

type AddDiveLogFormProps = {
  initialValue?: DiveLogPreview | null;
  onSubmitSuccess?: () => void;
  onCancelEdit?: () => void;
};

export function AddDiveLogForm({ initialValue, onSubmitSuccess, onCancelEdit }: AddDiveLogFormProps) {
  const { addDiveLog, updateDiveLog, diveSites, diveLogs } = useDemoData();
  const { members, currentUser } = useAuth();
  const { t, locale } = useI18n();
  const fallbackDiverId = currentUser?.id ?? "";
  const formSchema = useMemo(() => createFormSchema(t), [t]);
  const difficultyLabels = useMemo<Record<DifficultyOption, string>>(() => ({
    Beginner: t("dashboard.dives.form.difficulty.beginner"),
    Fortgeschritten: t("dashboard.dives.form.difficulty.advanced"),
    Pro: t("dashboard.dives.form.difficulty.pro")
  }), [t]);
  const numberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const computeNextLogNumber = useCallback(
    (diverId: string | undefined | null) => {
      if (!diverId) {
        return 1;
      }

      const relevantLogs = diveLogs.filter((log) => log.diverId === diverId);
      if (relevantLogs.length === 0) {
        return 1;
      }

      const highest = relevantLogs.reduce((max, log) => Math.max(max, log.logNumber ?? 0), 0);
      return highest + 1;
    },
    [diveLogs]
  );

  const buildFormState = useCallback(
    (
      value?: DiveLogPreview | null,
      preferredDiverId?: string | null,
      preferredLogNumber?: number
    ): FormInput => {
      const base = createInitialForm(value, fallbackDiverId);
      if (value) {
        return base;
      }

      const diverId = preferredDiverId ?? base.diverId ?? fallbackDiverId ?? "";
      const autoNumber = computeNextLogNumber(diverId);
      const nextNumber = preferredLogNumber && preferredLogNumber > 0
        ? Math.max(autoNumber, preferredLogNumber)
        : autoNumber;
      return {
        ...base,
        diverId,
        logNumber: nextNumber
      };
    },
    [computeNextLogNumber, fallbackDiverId]
  );

  const [form, setForm] = useState<FormInput>(() => buildFormState(initialValue));
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const isEditing = Boolean(initialValue);
  const siteListId = useId();

  const hasErrors = useMemo(() => Object.values(errors).some(Boolean), [errors]);

  const memberOptions = useMemo(() => {
    return [...members]
      .map((member) => ({ id: member.id, label: member.name }))
      .sort((a, b) => a.label.localeCompare(b.label, locale));
  }, [members, locale]);

  const siteOptions = useMemo(() => {
    return [...diveSites]
      .map((site) => ({
        id: site.id,
        label: `${site.name} (${site.country})`,
        value: site.name
      }))
      .sort((a, b) => a.value.localeCompare(b.value, locale));
  }, [diveSites, locale]);

  useEffect(() => {
    setForm(buildFormState(initialValue));
    setErrors({});
    setStatus("idle");
  }, [initialValue, buildFormState]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    const key = name as keyof FormInput;
    setForm((previous: FormInput) => {
      const numericFields: Array<keyof FormInput> = ["depth", "duration", "logNumber"];
      const convertedValue = numericFields.includes(key) ? Number(value) : value;
      const nextForm: FormInput = {
        ...previous,
        [key]: convertedValue as FormInput[keyof FormInput]
      } as FormInput;

      if (!isEditing && key === "diverId") {
        const diverIdValue = typeof convertedValue === "string" ? convertedValue : "";
        nextForm.logNumber = computeNextLogNumber(diverIdValue);
      }

      return nextForm;
    });
    setErrors((previous: FormErrors) => {
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
    setForm((previous: FormInput) => ({
      ...previous,
      location,
      siteId: matched?.id ?? previous.siteId
    }));
    setErrors((previous: FormErrors) => {
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
    setForm((previous: FormInput) => ({
      ...previous,
      siteId,
      location: matched ? matched.name : previous.location
    }));
    setErrors((previous: FormErrors) => {
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

    if (isEditing && initialValue) {
      setForm(buildFormState(initialValue));
    } else {
      setForm(buildFormState(null, normalizedPayload.diverId, normalizedPayload.logNumber + 1));
    }
    setErrors({});
    setStatus("success");
    onSubmitSuccess?.();
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
      <header className="mb-4 space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">
          {isEditing ? t("dashboard.dives.form.heading.edit") : t("dashboard.dives.form.heading.create")}
        </h2>
        <p className="text-xs text-slate-500">
          {t("dashboard.dives.form.description")}
        </p>
      </header>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
            {t("dashboard.dives.form.fields.title.label")}
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder={t("dashboard.dives.form.fields.title.placeholder")}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
            {errors.title && <span className="text-xs font-normal text-rose-600">{errors.title}</span>}
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
            {t("dashboard.dives.form.fields.diver.label")}
            <select
              name="diverId"
              value={form.diverId}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            >
              <option value="" disabled>
                {t("dashboard.dives.form.fields.diver.placeholder")}
              </option>
              {memberOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.diverId && <span className="text-xs font-normal text-rose-600">{errors.diverId}</span>}
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
            {t("dashboard.dives.form.fields.logNumber.label")}
            <input
              type="number"
              name="logNumber"
              min={1}
              value={form.logNumber}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
            {errors.logNumber ? (
              <span className="text-xs font-normal text-rose-600">{errors.logNumber}</span>
            ) : (
              <span className="text-[11px] font-normal text-slate-500">
                {t("dashboard.dives.form.fields.logNumber.helper")}
              </span>
            )}
          </label>
        </div>
        <div className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
          <label className="flex flex-col gap-2">
            {t("dashboard.dives.form.fields.location.label")}
            <input
              name="location"
              list={siteListId}
              value={form.location}
              onChange={handleChange}
              placeholder={t("dashboard.dives.form.fields.location.placeholder")}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
          </label>
          {errors.location && (
            <span className="text-xs font-normal text-rose-600">{errors.location}</span>
          )}
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
            {t("dashboard.dives.form.fields.site.label")}
            <select
              name="siteId"
              value={form.siteId ?? ""}
              onChange={(event) => handleSiteSelect(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            >
              <option value="">{t("dashboard.dives.form.fields.site.none")}</option>
              {siteOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {siteOptions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-normal text-slate-500">
              <span>{t("dashboard.dives.form.fields.site.suggestions")}</span>
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
                    {t("dashboard.dives.form.fields.site.more").replace("{count}", numberFormatter.format(siteOptions.length - 4))}
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
            {t("dashboard.dives.form.fields.date.label")}
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
            {t("dashboard.dives.form.fields.depth.label")}
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
            {t("dashboard.dives.form.fields.duration.label")}
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
            {t("dashboard.dives.form.fields.buddy.label")}
            <input
              name="buddy"
              value={form.buddy}
              onChange={handleChange}
              placeholder={t("dashboard.dives.form.fields.buddy.placeholder")}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
            {errors.buddy && <span className="text-xs font-normal text-rose-600">{errors.buddy}</span>}
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
            {t("dashboard.dives.form.fields.difficulty.label")}
            <select
              name="difficulty"
              value={form.difficulty}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            >
              {difficulties.map((option) => (
                <option key={option} value={option}>
                  {difficultyLabels[option]}
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
            {isEditing ? t("dashboard.dives.form.actions.submit.edit") : t("dashboard.dives.form.actions.submit.create")}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-400 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            >
              {t("dashboard.dives.form.actions.cancel")}
            </button>
          )}
        </div>
        {status === "success" && !hasErrors && (
          <p className="text-xs font-semibold text-emerald-600">
            {t("dashboard.dives.form.status.success")}
          </p>
        )}
      </form>
    </section>
  );
}
