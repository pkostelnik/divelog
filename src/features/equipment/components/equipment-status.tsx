"use client";

import clsx from "clsx";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";

import type { EquipmentItem } from "@/data/mock-data";
import { useDemoData } from "@/providers/demo-data-provider";

const statusMap = {
  bereit: "bg-emerald-100 text-emerald-700",
  wartung: "bg-amber-100 text-amber-700",
  defekt: "bg-rose-100 text-rose-700"
} as const;

type StatusKey = keyof typeof statusMap;

type EquipmentFormState = {
  manufacturer: string;
  model: string;
  serialNumber: string;
  status: EquipmentItem["status"];
  lastService: string;
};

function createEquipmentFormState(initial?: EquipmentItem): EquipmentFormState {
  if (initial) {
    return {
      manufacturer: initial.manufacturer,
      model: initial.model,
      serialNumber: initial.serialNumber,
      status: initial.status,
      lastService: initial.lastService
    };
  }

  return {
    manufacturer: "",
    model: "",
    serialNumber: "",
    status: "bereit",
    lastService: new Date().toISOString().slice(0, 10)
  };
}

export function EquipmentStatus() {
  const { equipment, updateEquipmentStatus, updateEquipment, removeEquipment, addEquipment } =
    useDemoData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EquipmentFormState>(() => createEquipmentFormState());
  const [newForm, setNewForm] = useState<EquipmentFormState>(() => createEquipmentFormState());

  const sortedEquipment = useMemo(() => {
    return [...equipment].sort((a, b) =>
      `${a.manufacturer} ${a.model}`.localeCompare(`${b.manufacturer} ${b.model}`)
    );
  }, [equipment]);

  const handleStatusChange = (id: string) => (event: ChangeEvent<HTMLSelectElement>) => {
    updateEquipmentStatus(id, event.target.value as EquipmentItem["status"]);
  };

  const handleServiceUpdate = (id: string) => {
    const today = new Date().toISOString().slice(0, 10);
    updateEquipmentStatus(id, "bereit", { lastService: today });
  };

  const startEdit = (item: EquipmentItem) => {
    setEditingId(item.id);
    setForm(createEquipmentFormState(item));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(createEquipmentFormState());
  };

  const handleFormChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    const key = name as keyof EquipmentFormState;
    setForm((previous) => ({
      ...previous,
      [key]: key === "status" ? (value as EquipmentItem["status"]) : value
    }));
  };

  const handleNewFormChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    const key = name as keyof EquipmentFormState;
    setNewForm((previous) => ({
      ...previous,
      [key]: key === "status" ? (value as EquipmentItem["status"]) : value
    }));
  };

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) {
      return;
    }

    updateEquipment(editingId, form);
    cancelEdit();
  };

  const handleCreateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addEquipment(newForm);
    setNewForm(createEquipmentFormState());
  };

  const handleDelete = (id: string) => {
    const confirmDelete = typeof window === "undefined" || window.confirm(
      "Soll dieser Ausrüstungsgegenstand wirklich gelöscht werden?"
    );

    if (!confirmDelete) {
      return;
    }

    removeEquipment(id);
    if (editingId === id) {
      cancelEdit();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Ausrüstung</h2>
        <p className="text-xs text-slate-500">
          Passe Status und Wartungsdatum an, um typische Prozesse nachzustellen.
        </p>
      </div>
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Neues Equipment erfassen</h3>
  <form className="mt-3 grid gap-3 md:grid-cols-5" onSubmit={handleCreateSubmit}>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
            Hersteller
            <input
              name="manufacturer"
              value={newForm.manufacturer}
              onChange={handleNewFormChange}
              placeholder="z. B. Apeks"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
            Modell
            <input
              name="model"
              value={newForm.model}
              onChange={handleNewFormChange}
              placeholder="Produktbezeichnung"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
            Seriennummer
            <input
              name="serialNumber"
              value={newForm.serialNumber}
              onChange={handleNewFormChange}
              placeholder="Seriennummer"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
            Status
            <select
              name="status"
              value={newForm.status}
              onChange={handleNewFormChange}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            >
              <option value="bereit">Bereit</option>
              <option value="wartung">Wartung</option>
              <option value="defekt">Defekt</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
            Letzter Service
            <input
              type="date"
              name="lastService"
              value={newForm.lastService}
              onChange={handleNewFormChange}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              required
            />
          </label>
          <div className="md:col-span-5">
            <button
              type="submit"
              className="inline-flex items-center rounded-xl bg-ocean-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-ocean-700"
            >
              Eintrag hinzufügen
            </button>
          </div>
        </form>
      </section>
      <ul className="space-y-3">
        {sortedEquipment.map((item) => {
          const isEditing = editingId === item.id;

          return (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
          >
              {isEditing ? (
                <form onSubmit={handleEditSubmit} className="w-full space-y-3">
                  <div className="grid gap-3 md:grid-cols-4">
                    <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                      Hersteller
                      <input
                        name="manufacturer"
                        value={form.manufacturer}
                        onChange={handleFormChange}
                        placeholder="z. B. Apeks"
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                        required
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                      Modell
                      <input
                        name="model"
                        value={form.model}
                        onChange={handleFormChange}
                        placeholder="Produktbezeichnung"
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                        required
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                      Seriennummer
                      <input
                        name="serialNumber"
                        value={form.serialNumber}
                        onChange={handleFormChange}
                        placeholder="Seriennummer"
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                        required
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                      Status
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleFormChange}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                      >
                        <option value="bereit">Bereit</option>
                        <option value="wartung">Wartung</option>
                        <option value="defekt">Defekt</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600 md:col-span-4 md:flex-row md:items-center">
                      <span className="md:min-w-[160px]">Letzter Service</span>
                      <input
                        type="date"
                        name="lastService"
                        value={form.lastService}
                        onChange={handleFormChange}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200 md:flex-1"
                        required
                      />
                    </label>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      className="inline-flex items-center rounded-xl bg-ocean-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-ocean-700"
                    >
                      Änderungen speichern
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="text-xs font-semibold text-slate-500 underline-offset-2 hover:underline"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-xs font-semibold text-rose-600 underline-offset-2 hover:underline"
                    >
                      Löschen
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="min-w-[55%]">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.manufacturer} {item.model}
                    </p>
                    <p className="text-xs text-slate-500">Seriennummer: {item.serialNumber}</p>
                    <p className="text-xs text-slate-500">Letzter Service: {item.lastService}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <select
                        value={item.status}
                        onChange={handleStatusChange(item.id)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                      >
                        <option value="bereit">Bereit</option>
                        <option value="wartung">Wartung</option>
                        <option value="defekt">Defekt</option>
                      </select>
                      <span
                        className={clsx(
                          "hidden rounded-full px-3 py-1 text-xs font-semibold md:inline",
                          statusMap[item.status as StatusKey]
                        )}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => handleServiceUpdate(item.id)}
                        className="text-ocean-700 underline-offset-2 hover:underline"
                      >
                        Service heute protokollieren
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
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
