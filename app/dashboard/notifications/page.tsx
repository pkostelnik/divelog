"use client";

import { NotificationTimeline } from "@/features/notifications/components/notification-timeline";
import { useI18n } from "@/providers/i18n-provider";

export default function DashboardNotificationsPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("dashboard.notifications.heading")}</h1>
        <p className="text-sm text-slate-600">{t("dashboard.notifications.description")}</p>
      </header>
      <NotificationTimeline />
    </div>
  );
}
