"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/providers/auth-provider";
import { useI18n } from "@/providers/i18n-provider";

export default function LogoutPage() {
  const { t } = useI18n();
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Perform logout and redirect immediately without delay
    logout();
    router.push("/");
  }, [logout, router]);

  return (
    <section className="bg-gradient-to-b from-white via-slate-50 to-slate-100 py-20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6">
        <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="inline-flex items-center justify-center rounded-full bg-ocean-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-ocean-700 dark:bg-ocean-900/40 dark:text-ocean-200">
            {t("auth.logout.badge")}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {t("auth.logout.heading")}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t("auth.logout.description")}
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/login"
              className="rounded-xl bg-ocean-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-ocean-700 dark:hover:bg-ocean-500"
            >
              {t("auth.logout.actions.login")}
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-slate-100"
            >
              {t("auth.logout.actions.home")}
            </Link>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("auth.logout.hint")}
          </p>
        </div>
      </div>
    </section>
  );
}
