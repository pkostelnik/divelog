"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { AppLogo } from "@/components/ui/app-logo";
import { useAuth } from "@/providers/auth-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useTheme } from "@/providers/theme-provider";
import type { SupportedLocale } from "@/i18n/translations";

type NavLink = {
  href: string;
  labelKey: string;
  children?: Array<{ href: string; labelKey: string }>;
};

const baseNavLinks: NavLink[] = [
  { href: "/dashboard", labelKey: "nav.dashboard" },
  { href: "/dashboard/dives", labelKey: "nav.dives" },
  {
    href: "/dashboard/community",
    labelKey: "nav.community",
    children: [
      { href: "/dashboard/community/blog", labelKey: "nav.community.blog" },
      { href: "/dashboard/community/forum", labelKey: "nav.community.forum" }
    ]
  },
  {
    href: "/dashboard/data",
    labelKey: "nav.content",
    children: [
      { href: "/dashboard/media", labelKey: "nav.content.media" },
      { href: "/dashboard/equipment", labelKey: "nav.content.equipment" },
      { href: "/dashboard/sites", labelKey: "nav.content.sites" }
    ]
  },
  { href: "/dashboard/search", labelKey: "nav.search" }
];

const adminOnlyLinks: NavLink[] = [{ href: "/dashboard/members", labelKey: "nav.members" }];

export function SiteHeader() {
  const { currentUser, logout } = useAuth();
  const firstName = currentUser?.name.split(" ")[0] ?? currentUser?.name ?? "";
  const { isDark, toggleTheme } = useTheme();
  const { t, availableLocales, locale, setLocale } = useI18n();
  const router = useRouter();
  const handleLogout = () => {
    logout();
    router.push("/auth/logout");
  };
  const visibleLinks = useMemo(() => {
    if (currentUser?.role === "admin") {
      const base = [...baseNavLinks];
      const membersLink = adminOnlyLinks[0];
      const searchIndex = base.findIndex((item) => item.href === "/dashboard/search");

      if (searchIndex >= 0) {
        base.splice(searchIndex, 0, membersLink);
      } else {
        base.push(membersLink);
      }

      return base;
    }

    return baseNavLinks;
  }, [currentUser?.role]);

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <AppLogo />
          <span className="text-lg font-semibold tracking-tight text-slate-900 transition-colors dark:text-slate-100">
            DiveLog Studio
          </span>
        </Link>
        <div className="flex items-center gap-6">
          {currentUser && (
            <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 transition-colors dark:text-slate-300 md:flex">
              {visibleLinks.map((item) => {
                if (!item.children) {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="transition-colors hover:text-ocean-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500 dark:hover:text-ocean-300"
                    >
                      {t(item.labelKey)}
                    </Link>
                  );
                }

                return (
                  <div key={item.href} className="relative group">
                    <Link
                      href={item.href}
                      aria-haspopup="true"
                      className="inline-flex items-center gap-1 transition-colors hover:text-ocean-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500 dark:hover:text-ocean-300"
                    >
                      {t(item.labelKey)}
                    </Link>
                    <div className="pointer-events-none absolute left-0 top-full z-20 hidden w-48 -translate-y-1 flex-col rounded-xl border border-slate-200 bg-white py-2 text-sm opacity-0 shadow-xl transition will-change-transform group-hover:pointer-events-auto group-hover:flex group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:flex group-focus-within:translate-y-0 group-focus-within:opacity-100 dark:border-slate-700 dark:bg-slate-900/95">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="px-4 py-2 text-slate-600 transition hover:bg-ocean-50 hover:text-ocean-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500 dark:text-slate-300 dark:hover:bg-ocean-900/30 dark:hover:text-ocean-200"
                        >
                          {t(child.labelKey)}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </nav>
          )}
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {currentUser ? (
              <>
                <Link
                  href="/dashboard/profile"
                  className="inline-flex items-center gap-2 rounded-full border border-ocean-200 bg-ocean-50 px-3 py-1 text-xs font-semibold text-ocean-700 transition hover:border-ocean-300 hover:bg-ocean-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-ocean-400"
                >
                  <span className="text-[11px] uppercase tracking-wide text-ocean-600">
                    {currentUser.role === "admin" ? t("header.role.admin") : t("header.role.member")}
                  </span>
                  <span className="text-sm text-ocean-800 dark:text-slate-100">{firstName || currentUser.name}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-700"
                >
                  {t("header.auth.logout")}
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-sm transition hover:border-ocean-300 hover:text-ocean-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-ocean-400 dark:hover:text-ocean-200"
                  aria-label={isDark ? t("header.theme.toggle.light") : t("header.theme.toggle.dark")}
                >
                  <span aria-hidden>{isDark ? "☀️" : "🌙"}</span>
                  <span className="text-xs font-semibold text-slate-700 transition-colors dark:text-slate-200">
                    {isDark ? t("header.theme.light") : t("header.theme.dark")}
                  </span>
                </button>
                <LanguageSwitcher
                  currentLocale={locale}
                  setLocale={setLocale}
                  availableLocales={availableLocales}
                  label={t("header.language")}
                />
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm transition hover:border-ocean-300 hover:text-ocean-700"
                >
                  {t("header.auth.login")}
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-full bg-ocean-600 px-3 py-1 text-sm text-white transition hover:bg-ocean-700"
                >
                  {t("header.auth.register")}
                </Link>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-sm transition hover:border-ocean-300 hover:text-ocean-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-ocean-400 dark:hover:text-ocean-200"
                  aria-label={isDark ? t("header.theme.toggle.light") : t("header.theme.toggle.dark")}
                >
                  <span aria-hidden>{isDark ? "☀️" : "🌙"}</span>
                  <span className="text-xs font-semibold text-slate-700 transition-colors dark:text-slate-200">
                    {isDark ? t("header.theme.light") : t("header.theme.dark")}
                  </span>
                </button>
                <LanguageSwitcher
                  currentLocale={locale}
                  setLocale={setLocale}
                  availableLocales={availableLocales}
                  label={t("header.language")}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

type LanguageSwitcherProps = {
  currentLocale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  availableLocales: Array<{ value: SupportedLocale; label: string; flag: string }>;
  label: string;
};

function LanguageSwitcher({ currentLocale, setLocale, availableLocales, label }: LanguageSwitcherProps) {
  return (
    <div className="relative inline-flex">
      <select
        aria-label={label}
        value={currentLocale}
        onChange={(event) => setLocale(event.target.value as SupportedLocale)}
        className="appearance-none rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-ocean-300 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      >
        {availableLocales.map((option) => (
          <option key={option.value} value={option.value}>
            {option.flag} {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
