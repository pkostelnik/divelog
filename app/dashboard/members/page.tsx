"use client";

import Link from "next/link";

import { MemberDirectory } from "@/features/members/components/member-directory";
import { useAuth } from "@/providers/auth-provider";

export default function MembersPage() {
  const { currentUser } = useAuth();

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Zugriff verweigert</h1>
          <p className="text-sm text-slate-600">
            Der Mitgliederbereich steht nur Administrator:innen zur Verfügung.
          </p>
        </header>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          <p>
            Wechsle zu deinem <Link href="/dashboard/profile" className="text-ocean-600 hover:underline">Profil</Link> oder nutze den Demo-Admin-Zugang über die <Link href="/auth/login" className="text-ocean-600 hover:underline">Anmeldeseite</Link>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mitglieder</h1>
        <p className="text-sm text-slate-600">
          Lerne die Crew kennen, entdecke Spezialgebiete und finde Buddies für den nächsten Trip.
        </p>
      </header>
      <MemberDirectory />
    </div>
  );
}
