"use client";

import Image from "next/image";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";

import type { DiveSite, MediaItem } from "@/data/mock-data";
import { useDemoData } from "@/providers/demo-data-provider";

const difficultyOptions: DiveSite["difficulty"][] = [
  "Beginner",
  "Fortgeschritten",
  "Pro"
];

type DiveSiteFormState = {
  name: string;
  country: string;
  difficulty: DiveSite["difficulty"];
  highlight: string;
  latitude: string;
  longitude: string;
};

function createSiteFormState(initial?: DiveSite): DiveSiteFormState {
  if (initial) {
    return {
      name: initial.name,
      country: initial.country,
      difficulty: initial.difficulty,
      highlight: initial.highlight,
      latitude: formatCoordinate(initial.coordinates.latitude),
      longitude: formatCoordinate(initial.coordinates.longitude)
    };
  }

  return {
    name: "",
    country: "",
    difficulty: "Beginner",
    highlight: "",
    latitude: "",
    longitude: ""
  };
}

export function DiveSiteGallery() {
  const {
    favoriteSiteIds,
    toggleFavoriteSite,
    favoriteMediaIds,
    toggleFavoriteMedia,
    mediaItems,
    diveSites,
    updateDiveSite,
    removeDiveSite,
    addDiveSite
  } = useDemoData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DiveSiteFormState>(() => createSiteFormState());
  const [newForm, setNewForm] = useState<DiveSiteFormState>(() => createSiteFormState());

  const highlightMedia = useMemo(() => mediaItems.slice(0, 2), [mediaItems]);
  const sortedSites = useMemo(() => [...diveSites].sort((a, b) => a.name.localeCompare(b.name)), [diveSites]);

  const beginEdit = (site: DiveSite) => {
    setEditingId(site.id);
    setForm(createSiteFormState(site));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(createSiteFormState());
  };

  const handleFormChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    const key = name as keyof DiveSiteFormState;
    setForm((previous) => ({
      ...previous,
      [key]: key === "difficulty" ? (value as DiveSite["difficulty"]) : value
    }));
  };

  const handleNewFormChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    const key = name as keyof DiveSiteFormState;
    setNewForm((previous) => ({
      ...previous,
      [key]: key === "difficulty" ? (value as DiveSite["difficulty"]) : value
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) {
      return;
    }

    const payload = formStateToPayload(form);
    if (!payload) {
      return;
    }

    updateDiveSite(editingId, payload);
    cancelEdit();
  };

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = formStateToPayload(newForm);
    if (!payload) {
      return;
    }

    addDiveSite(payload);
    setNewForm(createSiteFormState());
  };

  const handleDelete = (id: string) => {
    const confirmed = typeof window !== "undefined"
      ? window.confirm("Soll dieser Tauchplatz wirklich gelöscht werden?")
      : true;

    if (!confirmed) {
      return;
    }

    removeDiveSite(id);
    if (editingId === id) {
      cancelEdit();
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Favorisierte Spots</h2>
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Neuen Tauchplatz anlegen</h3>
          <form className="mt-3 space-y-3" onSubmit={handleCreate}>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                Name
                <input
                  name="name"
                  value={newForm.name}
                  onChange={handleNewFormChange}
                  placeholder="Spot-Bezeichnung"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                Land / Region
                <input
                  name="country"
                  value={newForm.country}
                  onChange={handleNewFormChange}
                  placeholder="z. B. Indonesien"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                  required
                />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
              Schwierigkeit
              <select
                name="difficulty"
                value={newForm.difficulty}
                onChange={handleNewFormChange}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              >
                {difficultyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
              Besonderheit
              <textarea
                name="highlight"
                value={newForm.highlight}
                onChange={handleNewFormChange}
                placeholder="Was macht den Spot besonders?"
                className="min-h-[80px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                required
              />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                Breitengrad
                <input
                  name="latitude"
                  value={newForm.latitude}
                  onChange={handleNewFormChange}
                  placeholder="z. B. 7.7783"
                  inputMode="decimal"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                Längengrad
                <input
                  name="longitude"
                  value={newForm.longitude}
                  onChange={handleNewFormChange}
                  placeholder="z. B. 98.3834"
                  inputMode="decimal"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                  required
                />
              </label>
            </div>
            <button
              type="submit"
              className="inline-flex items-center rounded-xl bg-ocean-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-ocean-700"
            >
              Tauchplatz hinzufügen
            </button>
          </form>
        </section>
        <ul className="space-y-3">
          {sortedSites.map((site) => {
            const isEditing = editingId === site.id;

            return (
              <li
                key={site.id}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
              >
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                        Name
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleFormChange}
                          placeholder="Tauchplatz"
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                          required
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                        Land / Region
                        <input
                          name="country"
                          value={form.country}
                          onChange={handleFormChange}
                          placeholder="z. B. Indonesien"
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                          required
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                        Schwierigkeit
                        <select
                          name="difficulty"
                          value={form.difficulty}
                          onChange={handleFormChange}
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                        >
                          {difficultyOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                      Besonderheit
                      <textarea
                        name="highlight"
                        value={form.highlight}
                        onChange={handleFormChange}
                        placeholder="Was macht den Spot besonders?"
                        className="min-h-[90px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                        required
                      />
                    </label>
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                        Breitengrad
                        <input
                          name="latitude"
                          value={form.latitude}
                          onChange={handleFormChange}
                          placeholder="z. B. 7.7783"
                          inputMode="decimal"
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                          required
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                        Längengrad
                        <input
                          name="longitude"
                          value={form.longitude}
                          onChange={handleFormChange}
                          placeholder="z. B. 98.3834"
                          inputMode="decimal"
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                          required
                        />
                      </label>
                    </div>
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
                        onClick={() => handleDelete(site.id)}
                        className="text-rose-600 underline-offset-2 hover:underline"
                      >
                        Löschen
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{site.name}</p>
                        <p className="text-xs text-slate-500">{site.country}</p>
                        <p className="text-[11px] text-slate-400">
                          GPS: {site.coordinates.latitude.toFixed(5)}°, {site.coordinates.longitude.toFixed(5)}°
                        </p>
                      </div>
                      <span className="rounded-full bg-ocean-50 px-3 py-1 text-xs font-semibold text-ocean-700">
                        {site.difficulty}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{site.highlight}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => toggleFavoriteSite(site.id)}
                        className="text-ocean-700 underline-offset-2 hover:underline"
                      >
                        {favoriteSiteIds.includes(site.id)
                          ? "Aus Favoriten entfernen"
                          : "Zu Favoriten hinzufügen"}
                      </button>
                      <button
                        type="button"
                        onClick={() => beginEdit(site)}
                        className="text-slate-600 underline-offset-2 hover:underline"
                      >
                        Bearbeiten
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(site.id)}
                        className="text-rose-600 underline-offset-2 hover:underline"
                      >
                        Löschen
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Medien Highlights</h2>
        <div className="grid gap-4">
          {highlightMedia.map((item) => (
            <figure
              key={item.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <MediaHighlightPreview item={item} />
              <figcaption className="px-4 py-3 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-500">von {item.author}</p>
                <button
                  type="button"
                  onClick={() => toggleFavoriteMedia(item.id)}
                  className="mt-2 text-xs font-semibold text-ocean-700 underline-offset-2 hover:underline"
                >
                  {favoriteMediaIds.includes(item.id) ? "Favorit gespeichert" : "Als Favorit merken"}
                </button>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}

function MediaHighlightPreview({ item }: { item: MediaItem }) {
  if (item.type === "video") {
    return (
      <video
        controls
        className="h-48 w-full bg-slate-900 object-cover"
        src={item.url}
      >
        Ihr Browser unterstützt kein eingebettetes Video.
      </video>
    );
  }

  if (item.source === "upload") {
    return <img src={item.url} alt={item.title} className="h-48 w-full object-cover" />;
  }

  if (isOptimizableImageUrl(item.url)) {
    return (
      <Image
        src={item.url}
        alt={item.title}
        width={800}
        height={500}
        className="h-48 w-full object-cover"
      />
    );
  }

  return <img src={item.url} alt={item.title} className="h-48 w-full object-cover" />;
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

function formStateToPayload(state: DiveSiteFormState) {
  const latitude = parseCoordinate(state.latitude);
  const longitude = parseCoordinate(state.longitude);

  if (latitude === null || longitude === null) {
    window.alert("Bitte gültige GPS-Koordinaten eingeben.");
    return null;
  }

  if (latitude < -90 || latitude > 90) {
    window.alert("Breitengrad muss zwischen -90 und 90 liegen.");
    return null;
  }

  if (longitude < -180 || longitude > 180) {
    window.alert("Längengrad muss zwischen -180 und 180 liegen.");
    return null;
  }

  return {
    name: state.name,
    country: state.country,
    difficulty: state.difficulty,
    highlight: state.highlight,
    coordinates: {
      latitude,
      longitude
    }
  } satisfies Omit<DiveSite, "id">;
}

function parseCoordinate(value: string): number | null {
  const normalised = value.replace(/,/g, ".").trim();
  if (normalised.length === 0) {
    return null;
  }

  const result = Number.parseFloat(normalised);
  if (Number.isNaN(result)) {
    return null;
  }

  return result;
}

function formatCoordinate(value: number): string {
  return value.toFixed(5);
}
