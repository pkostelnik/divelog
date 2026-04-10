/**
 * Registrierungsseite — Formular zur Erstellung eines neuen Demo-Accounts.
 *
 * Zeigt dezentes Korallenriff-Hintergrundbild. Neue Accounts werden
 * im AuthProvider im Client-State angelegt (Demo-Modus).
 */
import Image from "next/image";

import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <div className="relative bg-gradient-to-b from-ocean-50/50 via-white to-slate-50 py-16 dark:from-abyss-900 dark:via-ocean-900/30 dark:to-slate-950">
      {/* Decorative coral reef image */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <Image
          src="https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=1920&q=60"
          alt=""
          fill
          className="object-cover opacity-[0.04] dark:opacity-[0.08]"
          priority={false}
        />
      </div>
      <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-8 px-6">
        <RegisterForm />
      </div>
    </div>
  );
}
