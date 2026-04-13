/** Basis-URL der Webapp (ohne Slash am Ende) */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://divelog.copilot.ovh";

/** API-Basis-URL */
export const API_URL = `${SITE_URL}/api`;
