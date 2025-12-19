"use client";

import Link from "next/link";

import { MemberDirectory } from "@/features/members/components/member-directory";
import { useAuth } from "@/providers/auth-provider";
import { useI18n } from "@/providers/i18n-provider";

export default function MembersPage() {
  const { currentUser } = useAuth();
  const { t } = useI18n();

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("dashboard.members.access.denied.title")}</h1>
          <p className="text-sm text-slate-600">
            {t("dashboard.members.access.denied.description")}
          </p>
        </header>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          <p>
            {t("dashboard.members.access.denied.hint", "Wechsle zu deinem {profile} oder nutze den Demo-Admin-Zugang über die {login}.")
              .replace("{profile}", "")}
            <Link href="/dashboard/profile" className="text-ocean-600 hover:underline">
              {t("dashboard.members.access.denied.profile")}
            </Link>
            {" " + t("dashboard.members.access.denied.hint").split("{profile}")[1].split("{login}")[0]}
            <Link href="/auth/login" className="text-ocean-600 hover:underline">
              {t("dashboard.members.access.denied.login")}
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("dashboard.members.heading")}</h1>
        <p className="text-sm text-slate-600">
          {t("dashboard.members.subtitle")}
        </p>
      </header>
      <MemberDirectory />
    </div>
  );
}
