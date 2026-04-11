package com.divelog.app

/**
 * Zentrale Konfiguration — DiveLog Studio (Android)
 *
 * Alle URLs, die sich je nach Umgebung ändern können,
 * werden hier zentral definiert.
 *
 * Änderung der Live-URL:
 *   1. `SITE_URL` unten anpassen
 *   2. Neu bauen (Android Studio → Build)
 */
object AppConfig {
    /** Basis-URL der Webapp (ohne Slash am Ende) */
    const val SITE_URL = "https://divelog.copilot.ovh"

    /** API-Basis-URL */
    const val API_URL = "$SITE_URL/api"
}
