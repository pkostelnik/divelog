import { DiveSiteGallery } from "@/features/sites/components/dive-site-gallery";

export default function DashboardSitesPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tauchplätze</h1>
        <p className="text-sm text-slate-600">
          Inspiration für kommende Trips inklusive Schwierigkeit, Highlights und visuellen Eindrücken.
        </p>
      </header>
      <DiveSiteGallery />
    </div>
  );
}
