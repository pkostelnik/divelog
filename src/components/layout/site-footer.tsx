/**
 * Globaler Site-Footer mit Copyright und Links zu Impressum/Datenschutz.
 */
"use client";

import Link from "next/link";

import { useI18n } from "@/providers/i18n-provider";

export function SiteFooter() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-ocean-100/50 bg-gradient-to-r from-white via-ocean-50/30 to-white dark:border-slate-800 dark:from-slate-900/70 dark:via-slate-900/90 dark:to-slate-900/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 text-sm text-slate-500 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
        <p>&copy; {currentYear} DiveLog Studio. {t("footer.rights")}</p>
        <nav aria-label="Footer navigation" className="flex items-center gap-4">
          <Link href="/impressum" className="hover:text-ocean-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500 focus-visible:ring-offset-2 dark:hover:text-ocean-400">
            {t("footer.imprint")}
          </Link>
          <Link href="/datenschutz" className="hover:text-ocean-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500 focus-visible:ring-offset-2 dark:hover:text-ocean-400">
            {t("footer.privacy")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
