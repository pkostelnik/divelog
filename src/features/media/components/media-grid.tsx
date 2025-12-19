"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type Dispatch,
  type FormEvent,
  type SetStateAction
} from "react";
import { createPortal } from "react-dom";

import type { MediaItem } from "@/data/mock-data";
import { useAuth } from "@/providers/auth-provider";
import { useDemoData } from "@/providers/demo-data-provider";
import { useI18n } from "@/providers/i18n-provider";

type MediaFormState = {
  title: string;
  author: string;
  mediaType: MediaItem["mediaType"];
  source: MediaItem["source"];
  url: string;
  fileName?: string;
  ownerId?: string;
};

type MediaGridProps = {
  showCreateForm?: boolean;
};

const MAX_UPLOAD_SIZE_BYTES = 12 * 1024 * 1024;
const MAX_UPLOAD_SIZE_MB = MAX_UPLOAD_SIZE_BYTES / (1024 * 1024);

const initialMediaForm: MediaFormState = {
  title: "",
  author: "",
  mediaType: "image",
  source: "url",
  url: "",
  fileName: undefined,
  ownerId: undefined
};

function createMediaForm(
  initial?: MediaItem,
  defaults?: { ownerId?: string; author?: string }
): MediaFormState {
  if (initial) {
    return {
      title: initial.title,
      author: initial.author,
      mediaType: initial.mediaType,
      source: initial.source,
      url: initial.url,
      fileName: initial.fileName,
      ownerId: initial.ownerId
    };
  }
  return {
    ...initialMediaForm,
    ownerId: defaults?.ownerId ?? initialMediaForm.ownerId,
    author: defaults?.author ?? initialMediaForm.author
  };
}

export function MediaGrid({ showCreateForm = true }: MediaGridProps) {
  const { t, locale } = useI18n();
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id ?? null;
  const canManageAll = currentUser?.role === "admin";
  const {
    mediaItems,
    addMediaItem,
    updateMediaItem,
    removeMediaItem,
    favoriteMediaIds,
    toggleFavoriteMedia
  } = useDemoData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MediaFormState>(() => createMediaForm());
  const [newForm, setNewForm] = useState<MediaFormState>(() =>
    createMediaForm(undefined, {
      ownerId: currentUserId ?? undefined,
      author: currentUser?.name
    })
  );
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const numberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  const sortedMedia = useMemo(() => {
    return [...mediaItems].sort((a, b) => a.title.localeCompare(b.title, locale));
  }, [mediaItems, locale]);

  const openPreview = useCallback((item: MediaItem) => {
    setPreviewItem(item);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewItem(null);
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setNewForm(createMediaForm());
      return;
    }

    setNewForm((previous) => ({
      ...previous,
      ownerId: currentUser.id,
      author: previous.author.trim().length > 0 ? previous.author : currentUser.name
    }));
  }, [currentUser]);

  const canModifyMedia = useCallback(
    (item: MediaItem) => {
      if (canManageAll) {
        return true;
      }
      if (!currentUserId) {
        return false;
      }
      return item.ownerId === currentUserId;
    },
    [canManageAll, currentUserId]
  );

  const handleFieldChange = (
    setter: Dispatch<SetStateAction<MediaFormState>>
  ) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;

    setter((previous) => {
      switch (name) {
        case "title":
          return { ...previous, title: value };
        case "author":
          return { ...previous, author: value };
        case "url":
          return { ...previous, url: value };
        case "type":
          return { ...previous, type: value as MediaItem["type"] };
        case "source": {
          const nextSource = value as MediaItem["source"];
          if (nextSource === previous.source) {
            return previous;
          }
          if (nextSource === "url") {
            return {
              ...previous,
              source: "url",
              url: "",
              fileName: undefined
            };
          }
          return {
            ...previous,
            source: "upload",
            url: "",
            fileName: undefined
          };
        }
        default:
          return previous;
      }
    });
  };

  const handleFileChange = (
    setter: Dispatch<SetStateAction<MediaFormState>>
  ) => async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      window.alert(t("dashboard.media.alert.fileTooLarge").replace("{size}", numberFormatter.format(MAX_UPLOAD_SIZE_MB)));
      input.value = "";
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file, t("dashboard.media.alert.fileReadError"));

      setter((previous) => ({
        ...previous,
        source: "upload",
        mediaType: file.type.startsWith("video") ? "video" : "image",
        url: dataUrl,
        fileName: file.name
      }));
    } catch (error) {
      console.error(error);
      window.alert(t("dashboard.media.alert.fileReadError"));
    } finally {
      input.value = "";
    }
  };

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newForm.source === "url" && newForm.url.trim().length === 0) {
      window.alert(t("dashboard.media.alert.urlRequired"));
      return;
    }

    if (newForm.source === "upload" && newForm.url.length === 0) {
      window.alert(t("dashboard.media.alert.uploadRequired"));
      return;
    }

    if (!currentUser) {
      window.alert(t("dashboard.media.alert.loginRequired"));
      return;
    }

    const ownerId = currentUser.id;
    const authorName = newForm.author.trim().length > 0 ? newForm.author : currentUser.name;

    addMediaItem({
      title: newForm.title,
      author: authorName,
      ownerId,
      type: "media" as const,
      mediaType: newForm.mediaType,
      source: newForm.source,
      url: newForm.url,
      fileName: newForm.fileName
    });

    setNewForm(createMediaForm(undefined, { ownerId, author: currentUser.name }));
  };

  const startEdit = (item: MediaItem) => {
    if (!canModifyMedia(item)) {
      window.alert(t("dashboard.media.alert.permissionEdit"));
      return;
    }

    setEditingId(item.id);
    setForm(createMediaForm(item));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(createMediaForm());
  };

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) {
      return;
    }
    if (form.source === "url" && form.url.trim().length === 0) {
      window.alert(t("dashboard.media.alert.urlRequired"));
      return;
    }

    if (form.source === "upload" && form.url.length === 0) {
      window.alert(t("dashboard.media.alert.uploadRequiredEdit"));
      return;
    }

    const target = mediaItems.find((item) => item.id === editingId);
    if (!target) {
      cancelEdit();
      return;
    }

    if (!canModifyMedia(target)) {
      window.alert(t("dashboard.media.alert.permissionUpdate"));
      cancelEdit();
      return;
    }

    updateMediaItem(editingId, {
      title: form.title,
      author: form.author,
      ownerId: target.ownerId,
      type: "media" as const,
      mediaType: form.mediaType,
      source: form.source,
      url: form.url,
      fileName: form.fileName
    });
    cancelEdit();
  };

  const handleDelete = (id: string) => {
    const target = mediaItems.find((item) => item.id === id);

    if (!target) {
      return;
    }

    if (!canModifyMedia(target)) {
      window.alert(t("dashboard.media.alert.permissionDelete"));
      return;
    }

    const confirmed = typeof window === "undefined"
      ? true
      : window.confirm(t("dashboard.media.alert.confirmDelete"));

    if (!confirmed) {
      return;
    }

    removeMediaItem(id);
    if (editingId === id) {
      cancelEdit();
    }
  };

  return (
    <div className="space-y-6">
      {showCreateForm && (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">{t("dashboard.media.form.heading")}</h2>
          <form onSubmit={handleCreate} className="mt-3 grid gap-3 md:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
              {t("dashboard.media.form.fields.title.label")}
              <input
                name="title"
                value={newForm.title}
                onChange={handleFieldChange(setNewForm)}
                placeholder={t("dashboard.media.form.fields.title.placeholder")}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
              {t("dashboard.media.form.fields.author.label")}
              <input
                name="author"
                value={newForm.author}
                onChange={handleFieldChange(setNewForm)}
                placeholder={t("dashboard.media.form.fields.author.placeholder")}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
              {t("dashboard.media.form.fields.type.label")}
              <select
                name="type"
                value={newForm.mediaType}
                onChange={handleFieldChange(setNewForm)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              >
                <option value="image">{t("dashboard.media.form.fields.type.options.image")}</option>
                <option value="video">{t("dashboard.media.form.fields.type.options.video")}</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
              {t("dashboard.media.form.fields.source.label")}
              <select
                name="source"
                value={newForm.source}
                onChange={handleFieldChange(setNewForm)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              >
                <option value="url">{t("dashboard.media.form.fields.source.options.url")}</option>
                <option value="upload">{t("dashboard.media.form.fields.source.options.upload")}</option>
              </select>
            </label>
            {newForm.source === "url" ? (
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 md:col-span-3">
                {t("dashboard.media.form.fields.url.label")}
                <input
                  name="url"
                  value={newForm.url}
                  onChange={handleFieldChange(setNewForm)}
                  placeholder="https://..."
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                  required={newForm.source === "url"}
                />
              </label>
            ) : (
              <div className="md:col-span-3 flex flex-col gap-2 text-xs font-semibold text-slate-600">
                <label className="flex flex-col gap-1">
                  {t("dashboard.media.form.fields.file.label")}
                  <input
                    type="file"
                    accept={newForm.mediaType === "video" ? "video/*" : "image/*"}
                    onChange={handleFileChange(setNewForm)}
                    className="cursor-pointer rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none"
                  />
                </label>
                {newForm.fileName ? (
                  <span className="text-xs font-normal text-slate-500">
                    {t("dashboard.media.form.fields.file.selected").replace("{file}", newForm.fileName)}
                  </span>
                ) : (
                  <span className="text-xs font-normal text-slate-500">
                    {t("dashboard.media.form.fields.file.empty")}
                  </span>
                )}
              </div>
            )}
            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={!currentUser}
                className="inline-flex items-center rounded-xl bg-ocean-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-ocean-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t("dashboard.media.form.submit")}
              </button>
            </div>
            {!currentUser && (
              <p className="md:col-span-3 text-xs font-normal text-slate-500">
                {t("dashboard.media.form.loginHint")}
              </p>
            )}
          </form>
        </section>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {sortedMedia.map((item) => {
          const isEditing = editingId === item.id;
          const userCanModify = canModifyMedia(item);
          const typeLabel = item.mediaType === "video"
            ? t("dashboard.media.labels.type.video")
            : t("dashboard.media.labels.type.image");
          const sourceLabel = item.source === "upload"
            ? t("dashboard.media.labels.source.upload")
            : t("dashboard.media.labels.source.url");
          const fileLabel = item.fileName
            ? t("dashboard.media.labels.fileName").replace("{file}", item.fileName)
            : "";
          const authorLine = t("dashboard.media.labels.author").replace("{name}", item.author);
          const metaLine = `${typeLabel} · ${sourceLabel}${fileLabel}`;

          return (
            <figure
              key={item.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              {!isEditing && (
                <div className="relative">
                  <MediaPreview item={item} />
                  <button
                    type="button"
                    onClick={() => openPreview(item)}
                    className="absolute inset-0 flex items-center justify-center bg-slate-950/0 text-xs font-semibold uppercase tracking-wide text-white opacity-0 transition hover:bg-slate-950/30 hover:opacity-100 focus-visible:bg-slate-950/40 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                  >
                    <span className="sr-only">{t("dashboard.media.preview.open").replace("{title}", item.title)}</span>
                  </button>
                </div>
              )}
              <figcaption className="px-4 py-3 text-sm text-slate-600">
                {isEditing ? (
                  <form className="space-y-3" onSubmit={handleEditSubmit}>
                    <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                      {t("dashboard.media.form.fields.title.label")}
                      <input
                        name="title"
                        value={form.title}
                        onChange={handleFieldChange(setForm)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                        required
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                      {t("dashboard.media.form.fields.author.label")}
                      <input
                        name="author"
                        value={form.author}
                        onChange={handleFieldChange(setForm)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                        required
                      />
                    </label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                        {t("dashboard.media.form.fields.type.label")}
                        <select
                          name="type"
                          value={form.mediaType}
                          onChange={handleFieldChange(setForm)}
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                        >
                          <option value="image">{t("dashboard.media.form.fields.type.options.image")}</option>
                          <option value="video">{t("dashboard.media.form.fields.type.options.video")}</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                        {t("dashboard.media.form.fields.source.label")}
                        <select
                          name="source"
                          value={form.source}
                          onChange={handleFieldChange(setForm)}
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                        >
                          <option value="url">{t("dashboard.media.form.fields.source.options.url")}</option>
                          <option value="upload">{t("dashboard.media.form.fields.source.options.upload")}</option>
                        </select>
                      </label>
                    </div>
                    {form.source === "url" ? (
                      <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                        {t("dashboard.media.form.fields.url.label")}
                        <input
                          name="url"
                          value={form.url}
                          onChange={handleFieldChange(setForm)}
                          placeholder="https://..."
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                          required={form.source === "url"}
                        />
                      </label>
                    ) : (
                      <div className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                        <label className="flex flex-col gap-1">
                          {t("dashboard.media.edit.file.replace")}
                          <input
                            type="file"
                            accept={form.mediaType === "video" ? "video/*" : "image/*"}
                            onChange={handleFileChange(setForm)}
                            className="cursor-pointer rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none"
                          />
                        </label>
                        <span className="text-xs font-normal text-slate-500">
                          {form.fileName
                            ? t("dashboard.media.edit.file.current").replace("{file}", form.fileName)
                            : t("dashboard.media.edit.file.unknown")}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                      <button
                        type="submit"
                        className="inline-flex items-center rounded-xl bg-ocean-600 px-4 py-2 text-white shadow-sm transition hover:bg-ocean-700"
                      >
                        {t("dashboard.media.edit.actions.save")}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="text-slate-500 underline-offset-2 hover:underline"
                      >
                        {t("dashboard.media.edit.actions.cancel")}
                      </button>
                      {userCanModify && (
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="text-rose-600 underline-offset-2 hover:underline"
                        >
                          {t("dashboard.media.actions.delete")}
                        </button>
                      )}
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">{authorLine}</p>
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">{metaLine}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => toggleFavoriteMedia(item.id)}
                        className="text-ocean-700 underline-offset-2 hover:underline"
                      >
                        {favoriteMediaIds.includes(item.id)
                          ? t("dashboard.media.actions.favorite.saved")
                          : t("dashboard.media.actions.favorite.add")}
                      </button>
                      {userCanModify ? (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="text-slate-600 underline-offset-2 hover:underline"
                          >
                            {t("dashboard.media.actions.edit")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="text-rose-600 underline-offset-2 hover:underline"
                          >
                            {t("dashboard.media.actions.delete")}
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-normal text-slate-400">
                          {t("dashboard.media.notice.restricted")}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </figcaption>
            </figure>
          );
        })}
      </div>
      {previewItem && <MediaPreviewOverlay item={previewItem} onClose={closePreview} />}
    </div>
  );
}

function readFileAsDataUrl(file: File, fallbackMessage: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      resolve(typeof reader.result === "string" ? reader.result : "");
    });
    reader.addEventListener("error", () => {
      reject(reader.error ?? new Error(fallbackMessage));
    });
    reader.readAsDataURL(file);
  });
}

function MediaPreview({ item }: { item: MediaItem }) {
  const { t } = useI18n();

  if (item.mediaType === "video") {
    return (
      <video
        controls
        className="h-56 w-full bg-slate-900 object-cover"
        src={item.url}
      >
        {t("dashboard.media.preview.unsupported")}
      </video>
    );
  }

  if (item.source === "upload") {
    return (
      <Image
        src={item.url}
        alt={item.title}
        width={900}
        height={600}
        className="h-56 w-full object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        unoptimized
      />
    );
  }

  const optimizable = isOptimizableImageUrl(item.url);

  return (
    <Image
      src={item.url}
      alt={item.title}
      width={900}
      height={600}
      className="h-56 w-full object-cover"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      unoptimized={!optimizable}
    />
  );
}

function MediaPreviewOverlay({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const { t } = useI18n();
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  if (typeof document === "undefined") {
    return null;
  }

  const optimizable = item.mediaType === "image" && item.source !== "upload" && isOptimizableImageUrl(item.url);
  const typeLabel = item.mediaType === "video"
    ? t("dashboard.media.labels.type.video")
    : t("dashboard.media.labels.type.image");
  const authorLine = t("dashboard.media.labels.author").replace("{name}", item.author);
  const fileLabel = item.fileName
    ? t("dashboard.media.labels.fileName").replace("{file}", item.fileName)
    : "";
  const metaLine = `${t("dashboard.media.preview.metaPrefix")} ${typeLabel}${fileLabel}`;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6"
      role="dialog"
      aria-modal="true"
      aria-label={t("dashboard.media.preview.label").replace("{title}", item.title)}
      onClick={onClose}
    >
      <div
        className="relative z-10 flex w-full max-w-5xl flex-col gap-4 overflow-hidden rounded-3xl bg-slate-950/90 p-4 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-900/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-400"
        >
          {t("dashboard.media.preview.close")}
        </button>
        <div className="flex max-h-[70vh] w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-900">
          {item.mediaType === "video" ? (
            <video
              controls
              autoPlay
              playsInline
              className="max-h-[70vh] w-full rounded-2xl bg-black object-contain"
              src={item.url}
            >
              {t("dashboard.media.preview.unsupported")}
            </video>
          ) : (
            <Image
              src={item.url}
              alt={item.title}
              width={1600}
              height={1000}
              className="h-full w-full max-h-[70vh] object-contain"
              sizes="100vw"
              unoptimized={!optimizable}
              priority
            />
          )}
        </div>
        <div className="space-y-1 text-sm text-slate-300">
          <p className="text-base font-semibold text-white">{item.title}</p>
          <p className="text-xs text-slate-400">{authorLine}</p>
          <p className="text-xs uppercase tracking-wide text-slate-500">{metaLine}</p>
        </div>
      </div>
    </div>,
    document.body
  );
}

function isOptimizableImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    return parsed.hostname === "images.unsplash.com";
  } catch (error) {
  console.warn("Could not validate image URL", error);
    return false;
  }
}
