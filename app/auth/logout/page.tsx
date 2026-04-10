"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/providers/auth-provider";
import { useI18n } from "@/providers/i18n-provider";

export default function LogoutPage() {
  const { t } = useI18n();
  const { logout } = useAuth();
  const router = useRouter();
  const didLogoutRef = useRef(false);

  useEffect(() => {
    if (didLogoutRef.current) {
      return;
    }

    didLogoutRef.current = true;
    // Perform logout and redirect immediately without delay
    logout();
    router.push("/");
  }, [logout, router]);

  return (
    <section className="bg-gradient-to-b from-ocean-50/50 via-white to-slate-50 py-20 dark:from-abyss-900 dark:via-ocean-900/30 dark:to-slate-950">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6">
        <div className="space-y-3 rounded-3xl border border-ocean-100/50 bg-white p-8 text-center shadow-sm dark:border-ocean-800/30 dark:bg-ocean-950/40">
          <span className="inline-flex items-center justify-center rounded-full bg-ocean-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-ocean-700 dark:bg-ocean-900/40 dark:text-ocean-200">
            {t("auth.logout.badge")}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-ocean-50">
            {t("auth.logout.heading")}
          </h1>
          <p className="text-sm text-slate-600 dark:text-ocean-200/70">
            {t("auth.logout.description")}
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/login"
              className="rounded-full bg-gradient-to-r from-ocean-500 to-ocean-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-ocean-500/20 transition hover:-translate-y-0.5 hover:shadow-xl dark:from-ocean-600 dark:to-ocean-500"
            >
              {t("auth.logout.actions.login")}
            </Link>
            <Link
              href="/"
              className="rounded-full border border-ocean-200 px-6 py-3 text-sm font-semibold text-ocean-700 shadow-sm transition hover:border-ocean-400 hover:text-ocean-800 dark:border-ocean-700 dark:text-ocean-200 dark:hover:border-ocean-500 dark:hover:text-ocean-100"
            >
              {t("auth.logout.actions.home")}
            </Link>
          </div>
          <p className="text-xs text-slate-500 dark:text-ocean-300/50">
            {t("auth.logout.hint")}
          </p>
        </div>
      </div>
    </section>
  );
}
