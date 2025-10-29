import { NotificationTimeline } from "@/features/notifications/components/notification-timeline";

export default function DashboardNotificationsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Benachrichtigungen</h1>
        <p className="text-sm text-slate-600">
          Historie aller wichtigen Ereignisse – in dieser Demo ausschließlich lokal generierte Daten.
        </p>
      </header>
      <NotificationTimeline />
    </div>
  );
}
