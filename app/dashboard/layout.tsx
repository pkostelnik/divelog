/**
 * Dashboard-Layout — Auth-Guard für alle /dashboard/* Routen.
 *
 * Prüft ob der Nutzer eingeloggt ist (Community-Seiten ausgenommen).
 * Zeigt eine Zugriff-verweigert-Seite mit Login-/Community-Links.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useAuth } from "@/providers/auth-provider";

const guestAccessiblePrefixes = ["/dashboard/community"];

function isGuestAccessible(path: string | null): boolean {
  if (!path) {
    return false;
  }
  return guestAccessiblePrefixes.some((prefix) => path.startsWith(prefix));
}

function AccessDenied() {
  return (
    <div className="bg-gradient-to-b from-ocean-50/50 to-white py-12 dark:from-slate-900 dark:to-slate-950" role="alert">
      <div className="mx-auto w-full max-w-3xl px-6">
        <div className="space-y-4 rounded-3xl border border-ocean-100/50 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Anmeldung erforderlich</h1>
          <p className="text-sm text-slate-600">
            Bitte melde dich an, um auf diesen Bereich zuzugreifen. Die Community-Inhalte bleiben als Leseansicht frei zugänglich.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-xl bg-ocean-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-ocean-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500 focus-visible:ring-offset-2"
            >
              Zur Anmeldung
            </Link>
            <Link
              href="/dashboard/community"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-400 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500 focus-visible:ring-offset-2"
            >
              Community ansehen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const pathname = usePathname();

  const guestAllowed = isGuestAccessible(pathname);
  const requiresAuth = !guestAllowed;

  if (requiresAuth && !currentUser) {
    return <AccessDenied />;
  }

  return (
    <div className="bg-gradient-to-b from-ocean-50/50 to-white py-12 dark:from-slate-900 dark:to-slate-950">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="rounded-3xl border border-ocean-100/50 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          {children}
        </div>
      </div>
    </div>
  );
}
