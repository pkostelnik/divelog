/**
 * Zentrale Konfiguration — DiveLog Studio
 *
 * Alle URLs, die sich je nach Umgebung (lokal / Staging / Produktion) ändern,
 * werden hier aus Umgebungsvariablen gelesen.
 *
 * Änderung der Live-URL:
 *   1. .env.local anpassen  →  NEXT_PUBLIC_SITE_URL=https://neue-domain.example.com
 *   2. Capacitor/Electron/Native Clients: siehe Clients/README.md
 */

/** Basis-URL der Webapp (ohne Slash am Ende) */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://divelog.copilot.ovh";

/** API-Basis-URL */
export const API_URL = `${SITE_URL}/api`;
