/**
 * Dashboard-Übersichtsseite — zeigt Tauchgänge, Karte, Ausrüstung
 * und Benachrichtigungen in einem Two-Column-Layout mit Hero-Banner.
 */
"use client";

import Image from "next/image";
import { DiveLogList } from "@/features/dives/components/dive-log-list";
import { EquipmentStatus } from "@/features/equipment/components/equipment-status";
import { NotificationTimeline } from "@/features/notifications/components/notification-timeline";
import { DiveSiteMap } from "@/features/sites/components/dive-site-map";
import { useI18n } from "@/providers/i18n-provider";

export default function DashboardPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      {/* Dashboard Hero Banner */}
      <div className="relative -m-8 mb-0 overflow-hidden rounded-t-3xl">
        <Image
          src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1400&q=70"
          alt="Taucher über tropischem Korallenriff"
          width={1400}
          height={400}
          className="h-40 w-full object-cover sm:h-48"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent dark:from-[#0c1f2e] dark:via-[#0c1f2e]/60"></div>
        <div className="absolute bottom-0 left-0 p-6">
          <p className="text-sm font-semibold text-ocean-600 dark:text-ocean-300">{t("dashboard.welcome")}</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-ocean-50">
            {t("dashboard.heading")}
          </h1>
          <p className="text-sm text-slate-600 dark:text-ocean-200/70">
            {t("dashboard.subtitle")}
          </p>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          <DiveLogList />
          <DiveSiteMap />
        </div>
        <div className="space-y-6">
          <EquipmentStatus />
          <NotificationTimeline />
        </div>
      </div>
    </div>
  );
}
