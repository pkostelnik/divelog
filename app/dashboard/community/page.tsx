import Link from "next/link";

const communitySections = [
  {
    title: "Community Blog",
    description: "Lesen und teilen von Erfahrungsberichten, Tipps und Inspirationen deiner Crew.",
    href: "/dashboard/community/blog",
    cta: "Blog entdecken"
  },
  {
    title: "Community Forum",
    description: "Starte Diskussionen, erhalte Antworten auf Fachfragen und vernetze dich mit anderen Members.",
    href: "/dashboard/community/forum",
    cta: "Forum öffnen"
  }
];

export default function DashboardCommunityPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Community</h1>
        <p className="text-sm text-slate-600">
          Willkommen im Community-Hub. Wähle zwischen Blog und Forum, um Stories zu entdecken oder aktiv in den Austausch zu gehen.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        {communitySections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-ocean-400 hover:shadow-lg"
          >
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ocean-600">
                Community Bereich
              </p>
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
