import { EquipmentStatus } from "@/features/equipment/components/equipment-status";

export default function DashboardEquipmentPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ausrüstung</h1>
        <p className="text-sm text-slate-600">
          Überblick über Wartungszustände, Serviceintervalle und Verfügbarkeit deiner wichtigsten Ausrüstung.
        </p>
      </header>
      <EquipmentStatus />
    </div>
  );
}
