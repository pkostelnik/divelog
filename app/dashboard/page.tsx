import { DiveLogList } from "@/features/dives/components/dive-log-list";
import { EquipmentStatus } from "@/features/equipment/components/equipment-status";
import { NotificationTimeline } from "@/features/notifications/components/notification-timeline";
import { DiveSiteMap } from "@/features/sites/components/dive-site-map";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-ocean-600">Willkommen zurück</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Dein persönliches DiveLog Dashboard
        </h1>
        <p className="text-sm text-slate-600">
          Diese Demo kombiniert fiktive Daten, um die wichtigsten Funktionen der Plattform zu visualisieren.
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
