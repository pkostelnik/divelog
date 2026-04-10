/**
 * Mitglieder-Avatar-Komponente mit dreistufigem Fallback:
 *
 * 1. Eigener Avatar (avatarUrl) — vom Nutzer hinterlegte HTTPS-URL
 * 2. Gravatar — automatisch aus der E-Mail-Adresse generiert (SHA-256)
 * 3. Initialen — farbiger Gradient-Kreis mit Namensbuchstaben
 *
 * Verfügbare Größen: sm (32px), md (40px), lg (56px), xl (96px)
 */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getGravatarUrl, getGravatarPlaceholder } from "@/lib/gravatar";

type MemberAvatarProps = {
  name: string;
  email: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeMap = {
  sm: { px: 32, cls: "h-8 w-8 text-xs" },
  md: { px: 40, cls: "h-10 w-10 text-sm" },
  lg: { px: 56, cls: "h-14 w-14 text-base" },
  xl: { px: 96, cls: "h-24 w-24 text-2xl" }
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export function MemberAvatar({ name, email, avatarUrl, size = "md", className = "" }: MemberAvatarProps) {
  const { px, cls } = sizeMap[size];
  const [gravatarSrc, setGravatarSrc] = useState(() => getGravatarPlaceholder(email, px * 2));
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getGravatarUrl(email, px * 2).then((url) => {
      if (!cancelled) setGravatarSrc(url);
    });
    return () => { cancelled = true; };
  }, [email, px]);

  const src = avatarUrl || gravatarSrc;
  const initials = getInitials(name);

  if (imgError && !avatarUrl) {
    return (
      <div
        className={`inline-flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ocean-400 to-reef-500 font-semibold text-white ${cls} ${className}`}
        aria-hidden="true"
        title={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={`Avatar von ${name}`}
      width={px}
      height={px}
      className={`flex-shrink-0 rounded-full object-cover ring-2 ring-ocean-200/50 dark:ring-ocean-700/50 ${cls} ${className}`}
      onError={() => setImgError(true)}
      unoptimized={src.includes("gravatar.com")}
    />
  );
}
