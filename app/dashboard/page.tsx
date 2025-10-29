"use client";

import { DiveLogList } from "@/features/dives/components/dive-log-list";
import { EquipmentStatus } from "@/features/equipment/components/equipment-status";
import { NotificationTimeline } from "@/features/notifications/components/notification-timeline";
import { DiveSiteMap } from "@/features/sites/components/dive-site-map";
import { useI18n } from "@/providers/i18n-provider";

export default function DashboardPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-ocean-600">{t("dashboard.welcome")}</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {t("dashboard.heading")}
        </h1>
        <p className="text-sm text-slate-600">
          {t("dashboard.subtitle")}
        </p>
      </header>
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
