"use client";

import { EquipmentStatus } from "@/features/equipment/components/equipment-status";
import { useI18n } from "@/providers/i18n-provider";

export default function DashboardEquipmentPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("dashboard.equipment.heading")}</h1>
        <p className="text-sm text-slate-600">{t("dashboard.equipment.description")}</p>
      </header>
      <EquipmentStatus />
    </div>
  );
}
