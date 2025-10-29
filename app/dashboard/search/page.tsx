import { DiveSearchPanel } from "@/features/search/components/dive-search-panel";

export default function DashboardSearchPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Suche &amp; Filter</h1>
        <p className="text-sm text-slate-600">
          Filtere Tauchgänge nach Spot, Buddy oder Schwierigkeitsgrad. Die Suche läuft komplett clientseitig auf Mock-Daten.
        </p>
      </header>
      <DiveSearchPanel />
    </div>
  );
}
