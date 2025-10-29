import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 text-sm text-slate-500 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
        <p>&copy; {new Date().getFullYear()} DiveLog Studio. Alle Rechte vorbehalten.</p>
        <div className="flex items-center gap-4">
          <Link href="/impressum" className="hover:text-ocean-600 dark:hover:text-ocean-300">
            Impressum
          </Link>
          <Link href="/datenschutz" className="hover:text-ocean-600 dark:hover:text-ocean-300">
            Datenschutz
          </Link>
        </div>
      </div>
    </footer>
  );
}
