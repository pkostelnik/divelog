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
    <div className="bg-slate-100 py-12" role="alert">
      <div className="mx-auto w-full max-w-3xl px-6">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Anmeldung erforderlich</h1>
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
    <div className="bg-slate-100 py-12">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
