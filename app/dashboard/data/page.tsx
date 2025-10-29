import Link from "next/link";

const dataSections = [
  {
    title: "Medienbibliothek",
    description: "Greife auf alle Fotos und Videos deiner Tauchgänge zu und teile Highlights mit der Crew.",
    href: "/dashboard/media",
    cta: "Medien öffnen"
  },
  {
    title: "Ausrüstungsverwaltung",
    description: "Verwalte Wartungsintervalle, Leihgeräte und den Status deiner kompletten Ausrüstung.",
    href: "/dashboard/equipment",
    cta: "Ausrüstung prüfen"
  },
  {
    title: "Tauchplatz-Archiv",
    description: "Stöbere durch Orte, Schwierigkeitsgrade und Highlights vergangener und geplanter Tauchgänge.",
    href: "/dashboard/sites",
    cta: "Tauchplätze ansehen"
  }
];

export default function DashboardDataPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Datenüberblick</h1>
        <p className="text-sm text-slate-600">
          Sammelpunkt für alle strukturierten Logbuch-Daten. Wechsle direkt zu Medien, Ausrüstung oder Tauchplätzen.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        {dataSections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-ocean-400 hover:shadow-lg"
          >
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ocean-600">Datenbereich</p>
              <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
              <p className="text-sm text-slate-600">{section.description}</p>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ocean-600 group-hover:underline">
              {section.cta}
              <span aria-hidden>→</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
