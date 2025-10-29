"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { z } from "zod";

import { useDemoData } from "@/providers/demo-data-provider";
import { useAuth } from "@/providers/auth-provider";
import { useI18n } from "@/providers/i18n-provider";

const ANONYMOUS_AUTHOR_ID_KEY = "divelog:community-anonymous-author-id";

function generateAnonymousAuthorId() {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? `anon-${crypto.randomUUID()}`
    : `anon-${Math.random().toString(16).slice(2)}-${Date.now()}`;
}

function ensureAnonymousAuthorId() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(ANONYMOUS_AUTHOR_ID_KEY);
    if (stored && stored.trim().length > 0) {
      return stored;
    }

    const generated = generateAnonymousAuthorId();
    window.localStorage.setItem(ANONYMOUS_AUTHOR_ID_KEY, generated);
    return generated;
  } catch {
    return null;
  }
}

function createThreadId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `thread-${Math.random().toString(16).slice(2)}-${Date.now()}`;
}

function createThreadSchema(t: (key: string) => string) {
  return z.object({
    title: z.string().min(3, t("dashboard.community.forum.form.errors.title.min")),
    author: z.string().min(2, t("dashboard.community.forum.form.errors.author.min")),
    categoryId: z.string().min(1, t("dashboard.community.forum.form.errors.category.required")),
    body: z.string().min(20, t("dashboard.community.forum.form.errors.body.min"))
  });
}

type ThreadSchema = ReturnType<typeof createThreadSchema>;
type ThreadFormInput = z.infer<ThreadSchema>;

const initialForm: ThreadFormInput = {
  title: "",
  author: "",
  categoryId: "",
  body: ""
};

type ThreadFormErrors = Partial<Record<keyof ThreadFormInput, string>>;

export function ForumThreadForm() {
  const { t } = useI18n();
  const threadSchema = useMemo(() => createThreadSchema(t), [t]);
  const { currentUser } = useAuth();
  const defaultAuthor = currentUser?.name?.trim() ?? "";
  const authorLocked = defaultAuthor.length > 0;

  const { forumCategories, addForumThread } = useDemoData();
  const anonymousAuthorIdRef = useRef<string | null>(null);
  const [form, setForm] = useState<ThreadFormInput>(() => ({
    ...initialForm,
    author: defaultAuthor
  }));
  const [errors, setErrors] = useState<ThreadFormErrors>({});
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [isExpanded, setIsExpanded] = useState(false);

  if (anonymousAuthorIdRef.current === null) {
    const ensured = ensureAnonymousAuthorId();
    anonymousAuthorIdRef.current = ensured ?? generateAnonymousAuthorId();
  }

  const anonymousAuthorId = anonymousAuthorIdRef.current;

  const categoryOptions = useMemo(() => {
    return forumCategories.map((category) => ({
      id: category.id,
      label: category.title
    }));
  }, [forumCategories]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    const key = name as keyof ThreadFormInput;
    if (key === "author" && authorLocked) {
      return;
    }
    setForm((previous) => ({
      ...previous,
      [key]: value
    }));
    setErrors((previous) => {
      if (!previous[key]) {
        return previous;
      }
      const { [key]: _removed, ...rest } = previous;
      return rest;
    });
    setStatus("idle");
  };

  const handleCancel = () => {
    setIsExpanded(false);
    setForm({
      ...initialForm,
      author: defaultAuthor
    });
    setErrors({});
    setStatus("idle");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const authorValue = authorLocked ? defaultAuthor : form.author;
    const parseResult = threadSchema.safeParse({
      title: form.title.trim(),
      author: authorValue.trim(),
      categoryId: form.categoryId,
      body: form.body.trim()
    });

    if (!parseResult.success) {
      const flattened = parseResult.error.flatten().fieldErrors;
      const nextErrors: ThreadFormErrors = {};
      Object.entries(flattened).forEach(([key, messages]) => {
        const message = messages?.[0];
        if (!message) {
          return;
        }
        nextErrors[key as keyof ThreadFormInput] = message;
      });
      setErrors(nextErrors);
      setStatus("idle");
      return;
    }

    const threadId = createThreadId();

    addForumThread({
      id: threadId,
      ...parseResult.data,
      authorId: currentUser?.id ?? anonymousAuthorId ?? undefined
    });
    setForm({
      ...initialForm,
      author: defaultAuthor
    });
    setErrors({});
    setStatus("success");
    setIsExpanded(false);
  };

  useEffect(() => {
    setForm((previous) => ({
      ...previous,
      author: defaultAuthor
    }));
  }, [defaultAuthor]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-4 space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">{t("dashboard.community.forum.form.heading")}</h2>
        <p className="text-xs text-slate-500">{t("dashboard.community.forum.form.description")}</p>
      </header>
      {status === "success" && !isExpanded && (
        <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {t("dashboard.community.forum.form.status.success")}
        </p>
      )}
      {!isExpanded ? (
        <button
          type="button"
          onClick={() => {
            setIsExpanded(true);
            setStatus("idle");
          }}
          className="inline-flex items-center rounded-xl bg-ocean-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-ocean-700"
        >
          {t("dashboard.community.forum.form.actions.expand")}
        </button>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
              {t("dashboard.community.forum.form.fields.title.label")}
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder={t("dashboard.community.forum.form.fields.title.placeholder")}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              />
              {errors.title && (
                <span className="text-xs font-normal text-rose-600">{errors.title}</span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
              {t("dashboard.community.forum.form.fields.author.label")}
              <input
                name="author"
                value={form.author}
                onChange={handleChange}
                placeholder={t("dashboard.community.forum.form.fields.author.placeholder")}
                readOnly={authorLocked}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              />
              {errors.author && (
                <span className="text-xs font-normal text-rose-600">{errors.author}</span>
              )}
            </label>
          </div>
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
            {t("dashboard.community.forum.form.fields.category.label")}
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            >
              <option value="">{t("dashboard.community.forum.form.fields.category.placeholder")}</option>
              {categoryOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <span className="text-xs font-normal text-rose-600">{errors.categoryId}</span>
            )}
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
            {t("dashboard.community.forum.form.fields.body.label")}
            <textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              placeholder={t("dashboard.community.forum.form.fields.body.placeholder")}
              className="min-h-[140px] rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
            {errors.body && (
              <span className="text-xs font-normal text-rose-600">{errors.body}</span>
            )}
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-500">{t("dashboard.community.forum.form.status.hint")}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-700"
              >
                {t("dashboard.community.forum.form.actions.cancel")}
              </button>
              <button
                type="submit"
                className="inline-flex items-center rounded-xl bg-ocean-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-ocean-700"
              >
                {t("dashboard.community.forum.form.actions.submit")}
              </button>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}
