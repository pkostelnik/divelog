import { MediaGrid } from "@/features/media/components/media-grid";

export default function DashboardMediaPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Medienbibliothek</h1>
        <p className="text-sm text-slate-600">
          Kuratierte Impressionen aus vergangenen Tauchgängen – alle Medien werden clientseitig geladen.
        </p>
      </header>
      <MediaGrid />
    </div>
  );
}
