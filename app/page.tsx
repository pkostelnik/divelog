import Link from "next/link";

const featureHighlights = [
  {
    title: "Dive Logs",
    description: "Analysiere Tiefenprofile, Luftverbrauch und Notizen zu jedem Tauchgang.",
    href: "/dashboard/dives"
  },
  {
    title: "Ausrüstung",
    description: "Verwalte Wartung, Inspektionen und Leihgeräte im Team.",
    href: "/dashboard/equipment"
  },
  {
    title: "Mitglieder",
    description: "Entdecke Crew-Profile, Rollen und Lieblingsspots deiner Community.",
    href: "/dashboard/members"
  },
  {
    title: "Community",
    description: "Teile Berichte, Fotos und Tipps mit deiner Crew.",
    href: "/dashboard/community"
  }
];

export default function LandingPage() {
  return (
    <section className="bg-gradient-to-b from-white to-slate-100 transition-colors dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-24">
        <div className="flex flex-col gap-6 text-center">
          <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-ocean-200 bg-ocean-50 px-4 py-1 text-sm text-ocean-700 transition-colors dark:border-ocean-800 dark:bg-ocean-900/40 dark:text-ocean-200">
            Next.js 15 • Tailwind CSS • Azure Cosmos DB ready
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 transition-colors dark:text-slate-100 md:text-5xl">
            DiveLog Studio Demo
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 transition-colors dark:text-slate-300">
            Diese Demo zeigt den geplanten Aufbau der Diving-Plattform – komplett clientseitig mit Demo-Daten, damit du das Nutzererlebnis ohne Backend spüren kannst.
          </p>
          <div className="flex flex-col justify-center gap-3 md:flex-row">
            <Link
              href="/dashboard"
              className="rounded-lg bg-ocean-600 px-5 py-3 text-sm font-semibold text-white shadow transition duration-200 hover:-translate-y-0.5 hover:bg-ocean-700 dark:hover:bg-ocean-500"
            >
              Dashboard öffnen
            </Link>
            <Link
              href="/dashboard/dives"
              className="rounded-lg border border-ocean-200 px-5 py-3 text-sm font-semibold text-ocean-700 shadow-sm transition duration-200 hover:border-ocean-400 hover:text-ocean-800 dark:border-ocean-800 dark:text-ocean-200 dark:hover:border-ocean-600 dark:hover:text-ocean-100"
            >
              Tauchgänge erkunden
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {featureHighlights.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-ocean-400 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-ocean-500"
            >
              <h3 className="text-xl font-semibold text-slate-900 transition-colors dark:text-slate-100">{feature.title}</h3>
              <p className="mt-3 text-sm text-slate-600 transition-colors dark:text-slate-300">{feature.description}</p>
              <span className="mt-4 inline-flex items-center text-sm font-semibold text-ocean-600 transition-colors group-hover:underline dark:text-ocean-300 dark:group-hover:text-ocean-200">
                Mehr erfahren →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
