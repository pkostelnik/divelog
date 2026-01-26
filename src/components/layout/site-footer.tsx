"use client";

import Link from "next/link";

import { useI18n } from "@/providers/i18n-provider";

export function SiteFooter() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 text-sm text-slate-500 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
        <p>&copy; {currentYear} DiveLog Studio. {t("footer.rights")}</p>
        <nav aria-label="Footer navigation" className="flex items-center gap-4">
          <Link href="/impressum" className="hover:text-ocean-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500 focus-visible:ring-offset-2 dark:hover:text-ocean-300">
            {t("footer.imprint")}
          </Link>
          <Link href="/datenschutz" className="hover:text-ocean-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500 focus-visible:ring-offset-2 dark:hover:text-ocean-300">
            {t("footer.privacy")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
