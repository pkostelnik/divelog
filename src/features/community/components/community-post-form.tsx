"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { z } from "zod";

import { useAuth } from "@/providers/auth-provider";
import { useDemoData } from "@/providers/demo-data-provider";
import { useI18n } from "@/providers/i18n-provider";

function createPostSchema(t: (key: string) => string) {
  return z.object({
    title: z.string().min(3, t("dashboard.community.postForm.errors.title.min")),
    author: z.string().min(2, t("dashboard.community.postForm.errors.author.min")),
    body: z.string().min(10, t("dashboard.community.postForm.errors.body.min")),
    diveLogId: z.string().optional()
  });
}

type PostAttachmentDraft = {
  id: string;
  url: string;
  title: string;
  source: "upload" | "url";
  type: "image";
  fileName?: string;
};
const ALLOWED_ATTACHMENT_MIME_TYPES = ["image/jpeg", "image/png"] as const;
const ALLOWED_ATTACHMENT_LABELS = ["JPEG", "PNG"];
const ALLOWED_ATTACHMENT_TYPES = new Set<string>(ALLOWED_ATTACHMENT_MIME_TYPES);
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;
const MAX_ATTACHMENT_SIZE_MB = MAX_ATTACHMENT_SIZE / (1024 * 1024);

type PostFormInput = {
  title: string;
  author: string;
  body: string;
  diveLogId: string;
};

type PostFormErrors = Partial<Record<keyof PostFormInput, string>>;

type CommunityPostFormProps = {
  onSubmitSuccess?: () => void;
};

const initialForm: PostFormInput = {
  title: "",
  author: "",
  body: "",
  diveLogId: ""
};

export function CommunityPostForm({ onSubmitSuccess }: CommunityPostFormProps) {
  const { t, locale } = useI18n();
  const postSchema = useMemo(() => createPostSchema(t), [t]);
  const attachmentTypeList = useMemo(() => ALLOWED_ATTACHMENT_LABELS.join(", "), []);
  const numberFormatter = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }), [locale]);
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(locale), [locale]);
  const { currentUser } = useAuth();
  const defaultAuthor = currentUser?.name?.trim() ?? "";
  const authorLocked = defaultAuthor.length > 0;
  const authorEmail = currentUser?.email?.trim().toLowerCase();

  const { addCommunityPost, diveLogs } = useDemoData();
  const [form, setForm] = useState<PostFormInput>(() => ({
    ...initialForm,
    author: defaultAuthor
  }));
  const [errors, setErrors] = useState<PostFormErrors>({});
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [attachments, setAttachments] = useState<PostAttachmentDraft[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const diveOptions = useMemo(() => {
    return diveLogs.map((log) => ({
      id: log.id,
      label: `${log.title} • ${dateFormatter.format(new Date(log.date))}`
    }));
  }, [diveLogs, dateFormatter]);

  useEffect(() => {
    setForm((previous) => ({
      ...previous,
      author: defaultAuthor
    }));
  }, [defaultAuthor]);

  const createAttachmentId = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return `attachment-${Math.random().toString(16).slice(2)}-${Date.now()}`;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    const key = name as keyof PostFormInput;
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

  const handleAttachmentUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setAttachmentError(null);
    let hadError = false;

    files.forEach((file) => {
      if (!ALLOWED_ATTACHMENT_TYPES.has(file.type)) {
        setAttachmentError(
          t("dashboard.community.postForm.attachments.error.type").replace(
            "{types}",
            attachmentTypeList
          )
        );
        hadError = true;
        return;
      }
      if (file.size > MAX_ATTACHMENT_SIZE) {
        setAttachmentError(
          t("dashboard.community.postForm.attachments.error.size").replace(
            "{size}",
            numberFormatter.format(MAX_ATTACHMENT_SIZE_MB)
          )
        );
        hadError = true;
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== "string") {
          return;
        }
        const fallbackTitle = t("dashboard.community.postForm.attachments.fallbackTitle");
        const title = file.name.replace(/\.[^.]+$/, "").trim() || fallbackTitle;
        setAttachments((previous) => [
          ...previous,
          {
            id: createAttachmentId(),
            url: result,
            title,
            fileName: file.name,
            source: "upload",
            type: "image"
          }
        ]);
        if (!hadError) {
          setAttachmentError(null);
        }
      };
      reader.readAsDataURL(file);
    });

    event.target.value = "";
  };

  const handleAttachmentRemove = (id: string) => {
    setAttachments((previous) => previous.filter((item) => item.id !== id));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");
    const authorValue = authorLocked ? defaultAuthor : form.author;
    const parseResult = postSchema.safeParse({
      title: form.title.trim(),
      author: authorValue.trim(),
      body: form.body.trim(),
      diveLogId: form.diveLogId ? form.diveLogId : undefined
    });

    if (!parseResult.success) {
      const nextErrors: PostFormErrors = {};
      const flattened = parseResult.error.flatten().fieldErrors;
      Object.entries(flattened).forEach(([key, messages]) => {
        const message = messages?.[0];
        if (!message) {
          return;
        }
        nextErrors[key as keyof PostFormInput] = message;
      });
      setErrors(nextErrors);
      setStatus("idle");
      return;
    }

    const attachmentFallbackTitle = t("dashboard.community.postForm.attachments.fallbackTitle");

    addCommunityPost({
      title: parseResult.data.title,
      author: parseResult.data.author,
      authorId: currentUser?.id,
      authorEmail,
      body: parseResult.data.body,
      diveLogId: parseResult.data.diveLogId,
      attachments: attachments.map((attachment) => ({
        ...attachment,
        title: attachment.title.trim() || attachment.fileName || attachmentFallbackTitle,
        type: "image" as const
      }))
    });

    setForm({
      ...initialForm,
      author: defaultAuthor
    });
    setAttachments([]);
    setAttachmentError(null);
    setErrors({});
    setStatus("success");
    onSubmitSuccess?.();
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-4 space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">{t("dashboard.community.postForm.heading")}</h2>
        <p className="text-xs text-slate-500">
          {t("dashboard.community.postForm.description")}
        </p>
      </header>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
            {t("dashboard.community.postForm.fields.title.label")}
            <input
              name="title"
              id="post-title"
              value={form.title}
              onChange={handleChange}
              placeholder={t("dashboard.community.postForm.fields.title.placeholder")}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "post-title-error" : undefined}
            />
            {errors.title && <span id="post-title-error" role="alert" className="text-xs font-normal text-rose-600">{errors.title}</span>}
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
            {t("dashboard.community.postForm.fields.author.label")}
            <input
              name="author"
              id="post-author"
              value={form.author}
              onChange={handleChange}
              placeholder={t("dashboard.community.postForm.fields.author.placeholder")}
              readOnly={authorLocked}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              aria-invalid={!!errors.author}
              aria-describedby={errors.author ? "post-author-error" : undefined}
            />
            {errors.author && <span id="post-author-error" role="alert" className="text-xs font-normal text-rose-600">{errors.author}</span>}
          </label>
        </div>
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
          {t("dashboard.community.postForm.fields.body.label")}
          <textarea
            name="body"
            id="post-body"
            value={form.body}
            onChange={handleChange}
            placeholder={t("dashboard.community.postForm.fields.body.placeholder")}
            className="min-h-[120px] rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            aria-invalid={!!errors.body}
            aria-describedby={errors.body ? "post-body-error" : undefined}
          />
          {errors.body && <span id="post-body-error" role="alert" className="text-xs font-normal text-rose-600">{errors.body}</span>}
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
          {t("dashboard.community.postForm.fields.dive.label")}
          <select
            name="diveLogId"
            value={form.diveLogId}
            onChange={handleChange}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
          >
            <option value="">{t("dashboard.community.postForm.fields.dive.placeholder")}</option>
            {diveOptions.map((log) => (
              <option key={log.id} value={log.id}>
                {log.label}
              </option>
            ))}
          </select>
          {errors.diveLogId && (
            <span className="text-xs font-normal text-rose-600">{errors.diveLogId}</span>
          )}
        </label>
        <div className="space-y-2 text-xs font-semibold text-slate-600">
          <span>{t("dashboard.community.postForm.attachments.label")}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleAttachmentUpload}
            className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm shadow-sm file:mr-3 file:rounded-lg file:border-0 file:bg-ocean-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
          />
          {attachmentError ? (
            <p className="text-xs font-normal text-rose-600">{attachmentError}</p>
          ) : (
            <p className="text-[11px] font-normal text-slate-500">
              {t("dashboard.community.postForm.attachments.helper").replace(
                "{size}",
                numberFormatter.format(MAX_ATTACHMENT_SIZE_MB)
              ).replace("{types}", attachmentTypeList)}
            </p>
          )}
          {attachments.length > 0 && (
            <ul className="grid gap-2 sm:grid-cols-2">
              {attachments.map((attachment) => (
                <li key={attachment.id} className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="aspect-video bg-slate-100">
                      <Image
                        src={attachment.url}
                        alt={attachment.title}
                        fill
                        sizes="(min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                        unoptimized
                      />
                  </div>
                  <div className="flex items-center justify-between gap-2 px-3 py-2 text-[11px] font-medium text-slate-600">
                    <span className="line-clamp-1" title={attachment.fileName ?? attachment.title}>
                      {attachment.fileName ?? attachment.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAttachmentRemove(attachment.id)}
                      className="rounded-lg border border-slate-300 px-2 py-1 text-[10px] font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-700"
                    >
                      {t("dashboard.community.postForm.attachments.remove")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center justify-between text-xs">
          {status === "success" ? (
            <p className="text-sm font-medium text-emerald-600">
              {t("dashboard.community.postForm.status.success")}
            </p>
          ) : (
            <span className="text-slate-500">{t("dashboard.community.postForm.status.hint")}</span>
          )}
          <button
            type="submit"
            className="inline-flex items-center rounded-xl bg-ocean-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-ocean-700"
          >
            {t("dashboard.community.postForm.submit")}
          </button>
        </div>
      </form>
    </section>
  );
}
