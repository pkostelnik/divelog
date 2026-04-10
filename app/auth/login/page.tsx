/**
 * Login-Seite — Anmeldeformular mit Demo-Zugängen und Social-Login-Optionen.
 *
 * Nutzt dezentes Unterwasser-Hintergrundbild für tropische Atmosphäre.
 * Formulardaten werden client-seitig über den AuthProvider verarbeitet.
 */
import Image from "next/image";

import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="relative bg-gradient-to-b from-ocean-50/50 via-white to-slate-50 py-16 dark:from-abyss-900 dark:via-ocean-900/30 dark:to-slate-950">
      {/* Decorative ocean image */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <Image
          src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&w=1920&q=60"
          alt=""
          fill
          className="object-cover opacity-[0.04] dark:opacity-[0.08]"
          priority={false}
        />
      </div>
      <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-8 px-6">
        <LoginForm />
      </div>
    </div>
  );
}
