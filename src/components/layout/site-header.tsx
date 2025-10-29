"use client";

import Link from "next/link";

import { AppLogo } from "@/components/ui/app-logo";
import { useAuth } from "@/providers/auth-provider";

type NavLink = {
  href: string;
  label: string;
  children?: Array<{ href: string; label: string }>;
};

const baseNavLinks: NavLink[] = [
  { href: "/", label: "Überblick" },
  {
    href: "/dashboard/data",
    label: "Daten",
    children: [
      { href: "/dashboard/media", label: "Medien" },
      { href: "/dashboard/equipment", label: "Ausrüstung" },
      { href: "/dashboard/sites", label: "Tauchplätze" }
    ]
  },
  { href: "/dashboard/dives", label: "Tauchgänge" },
  { href: "/dashboard", label: "Dashboard" },
  {
    href: "/dashboard/community",
    label: "Community",
    children: [
      { href: "/dashboard/community/blog", label: "Blog" },
      { href: "/dashboard/community/forum", label: "Forum" }
    ]
  },
  { href: "/dashboard/search", label: "Suche" }
];

const adminOnlyLinks: NavLink[] = [{ href: "/dashboard/members", label: "Mitglieder" }];

const navLinks: NavLink[] = [...baseNavLinks, ...adminOnlyLinks];

export function SiteHeader() {
  const { currentUser, logout } = useAuth();
  const visibleLinks = currentUser?.role === "admin" ? navLinks : baseNavLinks;

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <AppLogo />
          <span className="text-lg font-semibold tracking-tight">DiveLog Studio</span>
        </Link>
        <div className="flex items-center gap-6">
          {currentUser && (
            <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
              {visibleLinks.map((item) => {
                if (!item.children) {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="transition-colors hover:text-ocean-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500"
                    >
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <div key={item.href} className="relative group">
                    <Link
                      href={item.href}
                      aria-haspopup="true"
                      className="inline-flex items-center gap-1 transition-colors hover:text-ocean-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500"
                    >
                      {item.label}
                    </Link>
                    <div className="pointer-events-none absolute left-0 top-full z-20 hidden w-48 -translate-y-1 flex-col rounded-xl border border-slate-200 bg-white py-2 text-sm opacity-0 shadow-xl transition will-change-transform group-hover:pointer-events-auto group-hover:flex group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:flex group-focus-within:translate-y-0 group-focus-within:opacity-100">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="px-4 py-2 text-slate-600 transition hover:bg-ocean-50 hover:text-ocean-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </nav>
          )}
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
            {currentUser ? (
              <>
                <span className="hidden sm:inline text-slate-500">
                  {currentUser.role === "admin" ? "Admin" : "Mitglied"}
                </span>
                <Link
                  href="/dashboard/profile"
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm transition hover:border-ocean-300 hover:text-ocean-700"
                >
                  {currentUser.name.split(" ")[0]}
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm transition hover:border-rose-300 hover:text-rose-600"
                >
                  Abmelden
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm transition hover:border-ocean-300 hover:text-ocean-700"
                >
                  Anmelden
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-full bg-ocean-600 px-3 py-1 text-sm text-white transition hover:bg-ocean-700"
                >
                  Registrieren
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
