"use client";

import Image from "next/image";
import {
  useMemo,
  useState,
  type ChangeEvent,
  type Dispatch,
  type FormEvent,
  type SetStateAction
} from "react";

import type { MediaItem } from "@/data/mock-data";
import { useDemoData } from "@/providers/demo-data-provider";

type MediaFormState = {
  title: string;
  author: string;
  type: MediaItem["type"];
  source: MediaItem["source"];
  url: string;
  fileName?: string;
};

const MAX_UPLOAD_SIZE_BYTES = 12 * 1024 * 1024;

const initialMediaForm: MediaFormState = {
  title: "",
  author: "",
  type: "image",
  source: "url",
  url: "",
  fileName: undefined
};

function createMediaForm(initial?: MediaItem): MediaFormState {
  if (initial) {
    return {
      title: initial.title,
      author: initial.author,
      type: initial.type,
      source: initial.source,
      url: initial.url,
      fileName: initial.fileName
    };
  }
  return { ...initialMediaForm };
}

export function MediaGrid() {
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
  const [newForm, setNewForm] = useState<MediaFormState>(() => createMediaForm());

  const sortedMedia = useMemo(() => {
    return [...mediaItems].sort((a, b) => a.title.localeCompare(b.title));
  }, [mediaItems]);

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
      window.alert("Die Datei ist größer als 12 MB. Bitte wähle eine kleinere Datei.");
      input.value = "";
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);

      setter((previous) => ({
        ...previous,
        source: "upload",
        type: file.type.startsWith("video") ? "video" : "image",
        url: dataUrl,
        fileName: file.name
      }));
    } catch (error) {
      console.error(error);
      window.alert("Die Datei konnte nicht gelesen werden. Bitte versuche es erneut.");
    } finally {
      input.value = "";
    }
  };

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newForm.source === "url" && newForm.url.trim().length === 0) {
      window.alert("Bitte gib eine gültige URL an.");
      return;
    }

    if (newForm.source === "upload" && newForm.url.length === 0) {
      window.alert("Bitte lade zuerst eine Datei hoch.");
      return;
    }

    addMediaItem({
      title: newForm.title,
      author: newForm.author,
      type: newForm.type,
      source: newForm.source,
      url: newForm.url,
      fileName: newForm.fileName
    });

  setNewForm(createMediaForm());
  };

  const startEdit = (item: MediaItem) => {
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
      window.alert("Bitte gib eine gültige URL an.");
      return;
    }

    if (form.source === "upload" && form.url.length === 0) {
      window.alert("Bitte lade zuerst eine Datei hoch oder wähle eine URL aus.");
      return;
    }

    updateMediaItem(editingId, {
      title: form.title,
      author: form.author,
      type: form.type,
      source: form.source,
      url: form.url,
      fileName: form.fileName
    });
    cancelEdit();
  };

  const handleDelete = (id: string) => {
    const confirmed = typeof window === "undefined"
      ? true
      : window.confirm("Soll dieses Medium wirklich gelöscht werden?");

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
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Neues Medium hinzufügen</h2>
        <form onSubmit={handleCreate} className="mt-3 grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
            Titel
            <input
              name="title"
              value={newForm.title}
              onChange={handleFieldChange(setNewForm)}
              placeholder="Bezeichnung des Mediums"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
            Autor:in
            <input
              name="author"
              value={newForm.author}
              onChange={handleFieldChange(setNewForm)}
              placeholder="Urheber oder Quelle"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
            Medientyp
            <select
              name="type"
              value={newForm.type}
              onChange={handleFieldChange(setNewForm)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            >
              <option value="image">Bild</option>
              <option value="video">Video</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
            Quelle
            <select
              name="source"
              value={newForm.source}
              onChange={handleFieldChange(setNewForm)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            >
              <option value="url">Externer Link</option>
              <option value="upload">Datei-Upload</option>
            </select>
          </label>
          {newForm.source === "url" ? (
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 md:col-span-3">
              Medien-URL
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
                Datei hochladen
                <input
                  type="file"
                  accept={newForm.type === "video" ? "video/*" : "image/*"}
                  onChange={handleFileChange(setNewForm)}
                  className="cursor-pointer rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none"
                />
              </label>
              {newForm.fileName ? (
                <span className="text-xs font-normal text-slate-500">
                  Ausgewählte Datei: {newForm.fileName}
                </span>
              ) : (
                <span className="text-xs font-normal text-slate-500">
                  Noch keine Datei ausgewählt
                </span>
              )}
            </div>
          )}
          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center rounded-xl bg-ocean-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-ocean-700"
            >
              Medium speichern
            </button>
          </div>
        </form>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        {sortedMedia.map((item) => {
          const isEditing = editingId === item.id;

          return (
            <figure
              key={item.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              {!isEditing && <MediaPreview item={item} />}
              <figcaption className="px-4 py-3 text-sm text-slate-600">
                {isEditing ? (
                  <form className="space-y-3" onSubmit={handleEditSubmit}>
                    <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                      Titel
                      <input
                        name="title"
                        value={form.title}
                        onChange={handleFieldChange(setForm)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                        required
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                      Autor:in
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
                        Medientyp
                        <select
                          name="type"
                          value={form.type}
                          onChange={handleFieldChange(setForm)}
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                        >
                          <option value="image">Bild</option>
                          <option value="video">Video</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                        Quelle
                        <select
                          name="source"
                          value={form.source}
                          onChange={handleFieldChange(setForm)}
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                        >
                          <option value="url">Externer Link</option>
                          <option value="upload">Datei-Upload</option>
                        </select>
                      </label>
                    </div>
                    {form.source === "url" ? (
                      <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                        Medien-URL
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
                          Datei ersetzen
                          <input
                            type="file"
                            accept={form.type === "video" ? "video/*" : "image/*"}
                            onChange={handleFileChange(setForm)}
                            className="cursor-pointer rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none"
                          />
                        </label>
                        <span className="text-xs font-normal text-slate-500">
                          Aktuell gespeichert: {form.fileName ?? "unbekannter Dateiname"}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                      <button
                        type="submit"
                        className="inline-flex items-center rounded-xl bg-ocean-600 px-4 py-2 text-white shadow-sm transition hover:bg-ocean-700"
                      >
                        Änderungen speichern
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="text-slate-500 underline-offset-2 hover:underline"
                      >
                        Abbrechen
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="text-rose-600 underline-offset-2 hover:underline"
                      >
                        Löschen
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">von {item.author}</p>
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">
                        {item.type === "video" ? "Video" : "Bild"} · {item.source === "upload" ? "Upload" : "Link"}
                        {item.fileName ? ` · ${item.fileName}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => toggleFavoriteMedia(item.id)}
                        className="text-ocean-700 underline-offset-2 hover:underline"
                      >
                        {favoriteMediaIds.includes(item.id)
                          ? "Favorit gespeichert"
                          : "Als Favorit merken"}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="text-slate-600 underline-offset-2 hover:underline"
                      >
                        Bearbeiten
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="text-rose-600 underline-offset-2 hover:underline"
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                )}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      resolve(typeof reader.result === "string" ? reader.result : "");
    });
    reader.addEventListener("error", () => {
      reject(reader.error ?? new Error("Datei konnte nicht gelesen werden."));
    });
    reader.readAsDataURL(file);
  });
}

function MediaPreview({ item }: { item: MediaItem }) {
  if (item.type === "video") {
    return (
      <video
        controls
        className="h-56 w-full bg-slate-900 object-cover"
        src={item.url}
      >
        Ihr Browser unterstützt kein eingebettetes Video.
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

function isOptimizableImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    return parsed.hostname === "images.unsplash.com";
  } catch (error) {
    console.warn("Konnte Bild-URL nicht prüfen", error);
    return false;
  }
}
