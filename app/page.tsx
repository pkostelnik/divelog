import Link from "next/link";

const featureHighlights = [
  {
    title: "Dive Logs",
    description: "Analysiere Tiefenprofile, Luftverbrauch und Notizen zu jedem Tauchgang.",
    accent: "Insights",
    href: "/dashboard/dives"
  },
  {
    title: "Equipment",
    description: "Behalte Wartungsintervalle, Inspektionen und Leihgeräte jederzeit im Blick.",
    accent: "Wartung",
    href: "/dashboard/equipment"
  },
  {
    title: "Mitglieder",
    description: "Verwalte Crew-Profile, Rollen sowie Trainingsziele in deiner Community.",
    accent: "Team",
    href: "/dashboard/members"
  },
  {
    title: "Community",
    description: "Blog, Forum, Medien & Highlights – alles an einem Ort teilbar.",
    accent: "Stories",
    href: "/dashboard/community"
  },
  {
    title: "Sichere Konto-Verwaltung",
    description:
      "Passwort ändern, Konto löschen und Inhalte anonymisieren – komplett clientseitig erlebbar.",
    accent: "Neu"
  },
  {
    title: "Social Sign-In Demo",
    description:
      "Google, Microsoft, Facebook, LinkedIn und Amazon als Mock-Anmeldung für schnelle Tests.",
    accent: "Preview"
  },
  {
    title: "Geführte Workflows",
    description:
      "Registrierung mit Doppel-Check, geführte Formulare und klares Feedback für jede Aktion.",
    accent: "UX"
  }
];

export default function LandingPage() {
  return (
    <section className="bg-gradient-to-b from-white to-slate-100 transition-colors dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-24">
        <div className="flex flex-col gap-6 text-center">
          <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-ocean-200 bg-ocean-50 px-4 py-1 text-sm text-ocean-700 transition-colors dark:border-ocean-800 dark:bg-ocean-900/40 dark:text-ocean-200">
            Next.js 16 · Tailwind CSS · Azure Cosmos DB ready
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 transition-colors dark:text-slate-100 md:text-5xl">
            DiveLog Studio Demo
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 transition-colors dark:text-slate-300">
            Erlebe den geplanten Funktionsumfang unserer Diving-Plattform – mit Social Logins, sicherer Konto-Verwaltung und voll responsiven Dashboards auf Basis von Mock-Daten.
          </p>
          <div className="flex flex-col justify-center gap-3 md:flex-row">
            <Link
              href="/auth/register"
              className="rounded-lg bg-ocean-600 px-5 py-3 text-sm font-semibold text-white shadow transition duration-200 hover:-translate-y-0.5 hover:bg-ocean-700 dark:hover:bg-ocean-500"
            >
              Jetzt registrieren
            </Link>
            <Link
              href="/auth/login"
              className="rounded-lg border border-ocean-200 px-5 py-3 text-sm font-semibold text-ocean-700 shadow-sm transition duration-200 hover:border-ocean-400 hover:text-ocean-800 dark:border-ocean-800 dark:text-ocean-200 dark:hover:border-ocean-600 dark:hover:text-ocean-100"
            >
              Zum Login
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-slate-100"
            >
              Demo erkunden
            </Link>
          </div>
          <p className="text-sm text-slate-500 transition-colors dark:text-slate-400">
            Demo-Zugänge, Social Sign-In, Passwort-Reset, Konto-Löschung &amp; Dive-Workflows – alles ohne Backend erlebbar.
          </p>
        </div>

        <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/60">
          <header className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-semibold text-slate-900 transition-colors dark:text-slate-100">
              Alles, was du für moderne Dive-Teams brauchst
            </h2>
            <p className="text-sm text-slate-600 transition-colors dark:text-slate-300">
              Diese Demo bündelt Produktideen, Account-Workflows und Datenmodelle, die später in Azure Cosmos DB und echte Auth-Provider überführt werden.
            </p>
          </header>
          <div className="grid gap-4 md:grid-cols-3">
            {featureHighlights.map((feature) => {
              const Card = (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-0.5 hover:border-ocean-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-ocean-500">
                  <span className="mb-3 inline-flex items-center rounded-full border border-ocean-200 bg-ocean-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-ocean-700 dark:border-ocean-700 dark:bg-ocean-900/40 dark:text-ocean-300">
                    {feature.accent}
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900 transition-colors dark:text-slate-100">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 transition-colors dark:text-slate-300">
                    {feature.description}
                  </p>
                  {feature.href && (
                    <span className="mt-4 inline-flex items-center text-sm font-semibold text-ocean-600 transition-colors dark:text-ocean-300">
                      Mehr erfahren →
                    </span>
                  )}
                </div>
              );

              return feature.href ? (
                <Link key={feature.title} href={feature.href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-400 focus-visible:ring-offset-2">
                  {Card}
                </Link>
              ) : (
                <div key={feature.title}>{Card}</div>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
}
