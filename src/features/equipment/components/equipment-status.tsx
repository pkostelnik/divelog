"use client";

import clsx from "clsx";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";

import type { EquipmentItem } from "@/data/mock-data";
import { useDemoData } from "@/providers/demo-data-provider";
import { useI18n } from "@/providers/i18n-provider";

const statusValues = ["bereit", "wartung", "defekt"] as const;

const statusMap: Record<(typeof statusValues)[number], string> = {
  bereit: "bg-emerald-100 text-emerald-700",
  wartung: "bg-amber-100 text-amber-700",
  defekt: "bg-rose-100 text-rose-700"
};

type StatusKey = (typeof statusValues)[number];

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
  const { t, locale } = useI18n();
  const { equipment, updateEquipmentStatus, updateEquipment, removeEquipment, addEquipment } =
    useDemoData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EquipmentFormState>(() => createEquipmentFormState());
  const [newForm, setNewForm] = useState<EquipmentFormState>(() => createEquipmentFormState());

  const sortedEquipment = useMemo(() => {
    return [...equipment].sort((a, b) =>
      `${a.manufacturer} ${a.model}`.localeCompare(`${b.manufacturer} ${b.model}`, locale)
    );
  }, [equipment, locale]);

  const statusOptions = useMemo(() => statusValues.map((value) => ({
    value,
    label: t(`dashboard.equipment.status.option.${value}`)
  })), [t]);

  const statusTags = useMemo<Record<StatusKey, string>>(() => ({
    bereit: t("dashboard.equipment.status.tag.bereit"),
    wartung: t("dashboard.equipment.status.tag.wartung"),
    defekt: t("dashboard.equipment.status.tag.defekt")
  }), [t]);

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
      t("dashboard.equipment.alert.confirmDelete")
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
        <h2 className="text-lg font-semibold text-slate-900">{t("dashboard.equipment.section.title")}</h2>
        <p className="text-xs text-slate-500">
          {t("dashboard.equipment.section.subtitle")}
        </p>
      </div>
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">{t("dashboard.equipment.form.heading")}</h3>
        <form className="mt-3 grid gap-3 md:grid-cols-5" onSubmit={handleCreateSubmit}>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
            {t("dashboard.equipment.form.fields.manufacturer.label")}
            <input
              name="manufacturer"
              value={newForm.manufacturer}
              onChange={handleNewFormChange}
              placeholder={t("dashboard.equipment.form.fields.manufacturer.placeholder")}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
            {t("dashboard.equipment.form.fields.model.label")}
            <input
              name="model"
              value={newForm.model}
              onChange={handleNewFormChange}
              placeholder={t("dashboard.equipment.form.fields.model.placeholder")}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
            {t("dashboard.equipment.form.fields.serial.label")}
            <input
              name="serialNumber"
              value={newForm.serialNumber}
              onChange={handleNewFormChange}
              placeholder={t("dashboard.equipment.form.fields.serial.placeholder")}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
            {t("dashboard.equipment.form.fields.status.label")}
            <select
              name="status"
              value={newForm.status}
              onChange={handleNewFormChange}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
            {t("dashboard.equipment.form.fields.lastService.label")}
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
              {t("dashboard.equipment.form.submit")}
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
                      {t("dashboard.equipment.form.fields.manufacturer.label")}
                      <input
                        name="manufacturer"
                        value={form.manufacturer}
                        onChange={handleFormChange}
                        placeholder={t("dashboard.equipment.form.fields.manufacturer.placeholder")}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                        required
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                      {t("dashboard.equipment.form.fields.model.label")}
                      <input
                        name="model"
                        value={form.model}
                        onChange={handleFormChange}
                        placeholder={t("dashboard.equipment.form.fields.model.placeholder")}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                        required
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                      {t("dashboard.equipment.form.fields.serial.label")}
                      <input
                        name="serialNumber"
                        value={form.serialNumber}
                        onChange={handleFormChange}
                        placeholder={t("dashboard.equipment.form.fields.serial.placeholder")}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                        required
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                      {t("dashboard.equipment.form.fields.status.label")}
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleFormChange}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600 md:col-span-4 md:flex-row md:items-center">
                      <span className="md:min-w-[160px]">{t("dashboard.equipment.form.fields.lastService.label")}</span>
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
                      {t("dashboard.equipment.edit.actions.save")}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="text-xs font-semibold text-slate-500 underline-offset-2 hover:underline"
                    >
                      {t("dashboard.equipment.edit.actions.cancel")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-xs font-semibold text-rose-600 underline-offset-2 hover:underline"
                    >
                      {t("dashboard.equipment.actions.delete")}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="min-w-[55%]">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.manufacturer} {item.model}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t("dashboard.equipment.list.serial").replace("{serial}", item.serialNumber)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t("dashboard.equipment.list.lastService").replace("{date}", item.lastService)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <select
                        value={item.status}
                        onChange={handleStatusChange(item.id)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <span
                        className={clsx(
                          "hidden rounded-full px-3 py-1 text-xs font-semibold md:inline",
                          statusMap[item.status as StatusKey]
                        )}
                      >
                        {statusTags[item.status as StatusKey]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => handleServiceUpdate(item.id)}
                        className="text-ocean-700 underline-offset-2 hover:underline"
                      >
                        {t("dashboard.equipment.actions.serviceToday")}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="text-slate-600 underline-offset-2 hover:underline"
                      >
                        {t("dashboard.equipment.actions.edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="text-rose-600 underline-offset-2 hover:underline"
                      >
                        {t("dashboard.equipment.actions.delete")}
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
