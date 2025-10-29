'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { z } from "zod";

import { useAuth } from "@/providers/auth-provider";
import { useDemoData } from "@/providers/demo-data-provider";

const postSchema = z.object({
  title: z.string().min(3, "Titel benötigt mindestens 3 Zeichen."),
  author: z.string().min(2, "Bitte einen Namen angeben."),
  body: z.string().min(10, "Beschreibe deinen Beitrag mit mindestens 10 Zeichen."),
  diveLogId: z.string().optional()
});

type PostAttachmentDraft = {
  id: string;
  url: string;
  title: string;
  source: "upload" | "url";
  type: "image";
  fileName?: string;
};
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;

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
    return diveLogs.map((log) => ({ id: log.id, label: `${log.title} • ${new Date(log.date).toLocaleDateString("de-DE")}` }));
  }, [diveLogs]);

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

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setAttachmentError("Nur Bilddateien können angehängt werden.");
        return;
      }
      if (file.size > MAX_ATTACHMENT_SIZE) {
        setAttachmentError("Ein Bild ist größer als 5 MB und wurde übersprungen.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== "string") {
          return;
        }
        const title = file.name.replace(/\.[^.]+$/, "").trim() || "Bildanhang";
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
        setAttachmentError(null);
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
        if (!messages?.length) {
          return;
        }
        nextErrors[key as keyof PostFormInput] = messages[0] ?? "";
      });
      setErrors(nextErrors);
      setStatus("idle");
      return;
    }

    addCommunityPost({
      title: parseResult.data.title,
      author: parseResult.data.author,
      authorId: currentUser?.id,
      authorEmail,
      body: parseResult.data.body,
      diveLogId: parseResult.data.diveLogId,
      attachments: attachments.map((attachment) => ({
        ...attachment,
        title: attachment.title.trim() || attachment.fileName || "Bildanhang",
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
        <h2 className="text-lg font-semibold text-slate-900">Neuen Beitrag teilen</h2>
        <p className="text-xs text-slate-500">
          Veröffentliche Neuigkeiten oder Fragen und verknüpfe sie mit einem bestehenden Tauchgang.
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
              placeholder="Worum geht es?"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
            {errors.title && <span className="text-xs font-normal text-rose-600">{errors.title}</span>}
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
            Autor:in
            <input
              name="author"
              value={form.author}
              onChange={handleChange}
              placeholder="Dein Name"
              readOnly={authorLocked}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
            {errors.author && <span className="text-xs font-normal text-rose-600">{errors.author}</span>}
          </label>
        </div>
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
          Beitrag
          <textarea
            name="body"
            value={form.body}
            onChange={handleChange}
            placeholder="Was möchtest du mit der Community teilen?"
            className="min-h-[120px] rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
          />
          {errors.body && <span className="text-xs font-normal text-rose-600">{errors.body}</span>}
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
          Tauchgang verknüpfen (optional)
          <select
            name="diveLogId"
            value={form.diveLogId}
            onChange={handleChange}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
          >
            <option value="">Kein Tauchgang ausgewählt</option>
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
          <span>Bilder anhängen (optional)</span>
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
            <p className="text-[11px] font-normal text-slate-500">JPEG oder PNG bis 5 MB pro Datei.</p>
          )}
          {attachments.length > 0 && (
            <ul className="grid gap-2 sm:grid-cols-2">
              {attachments.map((attachment) => (
                <li key={attachment.id} className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="aspect-video bg-slate-100">
                    <img
                      src={attachment.url}
                      alt={attachment.title}
                      className="h-full w-full object-cover"
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
                      Entfernen
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center justify-between text-xs">
          {status === "success" ? (
            <p className="text-sm font-medium text-emerald-600">Beitrag wurde veröffentlicht.</p>
          ) : (
            <span className="text-slate-500">Titel, Autor:in und Inhalt sind Pflichtfelder.</span>
          )}
          <button
            type="submit"
            className="inline-flex items-center rounded-xl bg-ocean-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-ocean-700"
          >
            Beitrag erstellen
          </button>
        </div>
      </form>
    </section>
  );
}
