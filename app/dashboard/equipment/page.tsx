"use client";

import Image from "next/image";

import { EquipmentStatus } from "@/features/equipment/components/equipment-status";
import { useI18n } from "@/providers/i18n-provider";

export default function DashboardEquipmentPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      {/* Equipment Hero Banner */}
      <div className="relative -m-8 mb-0 overflow-hidden rounded-t-3xl">
        <Image
          src="https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1400&q=70"
          alt="Tauchausrüstung bereit für den Einsatz"
          width={1400}
          height={400}
          className="h-36 w-full object-cover sm:h-44"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent dark:from-[#0c1f2e] dark:via-[#0c1f2e]/60"></div>
      </div>
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("dashboard.equipment.heading")}</h1>
        <p className="text-sm text-slate-600">{t("dashboard.equipment.description")}</p>
      </header>
      <EquipmentStatus />
    </div>
  );
}
