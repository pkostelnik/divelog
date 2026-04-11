import Foundation

/// Zentrale Konfiguration — DiveLog Studio (iOS/iPadOS)
///
/// Alle URLs, die sich je nach Umgebung ändern können,
/// werden hier zentral definiert.
///
/// Änderung der Live-URL:
///   1. `siteURL` unten anpassen
///   2. Neu bauen (Xcode → Build)
enum AppConfig {
    /// Basis-URL der Webapp (ohne Slash am Ende)
    static let siteURL = "https://divelog.copilot.ovh"

    /// API-Basis-URL
    static let apiURL = "\(siteURL)/api"
}
