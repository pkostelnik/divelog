# DiveLog Clients

## Überblick
Dieses Verzeichnis enthält die geplanten Client-Anwendungen für verschiedene Zielplattformen sowie einen gemeinsamen Shared-Bereich.

Die Prozentwerte sind als grobe Projektsteuerung gedacht und werden bei jedem relevanten Fortschritt aktualisiert.

## Client-Übersicht

| Plattform | Form | Pfad | Entwicklungsstand | Status |
|---|---|---|---:|---|
| Web | PWA (bestehende Next.js-Webapp, außerhalb von Clients) | ../ | 75% | In Betrieb / laufende Weiterentwicklung |
| iOS / iPadOS | Nativ (SwiftUI) — eine gemeinsame App für iPhone und iPad | ios/ | 10% | App-Skelett erstellt |
| macOS | Nativ (SwiftUI/AppKit je nach Bedarf) | macos/ | 0% | Geplant |
| Android | Nativ (Kotlin + Jetpack Compose) | android/ | 10% | App-Skelett erstellt |
| Windows | Nativ (WinUI 3 / .NET) | windows/ | 0% | Geplant |
| Shared Components | Wiederverwendbare Logik, UI-Bausteine, Typen, Services | shared/ | 15% | API-Vertrag + i18n Strings |

## Hinweis: iOS und iPadOS
iOS und iPadOS werden als **eine einzige App** im Ordner `ios/` entwickelt. SwiftUI bietet adaptive Layouts (NavigationSplitView, horizontalSizeClass), sodass sich die App automatisch an iPhone und iPad anpasst. Ein separater iPadOS-Ordner ist daher nicht nötig.

## Shared-Bereich
Der Shared-Bereich enthält die gemeinsame Grundlage für alle Clients:

- components
- hooks
- services
- types
- utils
- assets
- i18n
- ui
- domain
- data
- platform-bridges

## Projektstruktur

```
Clients/
├── shared/              ← Gemeinsame Basis für alle Clients
│   ├── domain/          ← API-Vertrag (Endpoints + Datentypen)
│   ├── i18n/            ← strings-de.json, strings-en.json
│   ├── components/      ← Wiederverwendbare UI-Bausteine
│   ├── data/            ← API-Client, Caching, Sync
│   ├── hooks/           ← Plattformübergreifende Hooks/Patterns
│   ├── services/        ← Geschäftslogik
│   ├── types/           ← Geteilte Typdefinitionen
│   ├── utils/           ← Hilfsfunktionen
│   ├── assets/          ← Icons, Bilder
│   └── platform-bridges/← Kamera, Push, Dateisystem
├── ios/                 ← SwiftUI App (iPhone + iPad)
│   └── DiveLog/
│       ├── Models/
│       ├── Services/    ← APIService (URLSession, async/await)
│       ├── ViewModels/  ← Auth, Dive, Equipment
│       └── Views/       ← Login, Dashboard, Dives, Equipment, Map, Profile
├── android/             ← Kotlin + Jetpack Compose App
│   └── app/src/main/java/com/divelog/app/
│       ├── data/        ← Models + ApiService (Ktor)
│       ├── viewmodel/   ← Auth, Dive, Equipment
│       └── ui/          ← Theme, Navigation, Screens
├── macos/               ← Geplant
└── windows/             ← Geplant
```

## Nächste Schritte
1. ✅ ~~App-Skelette für iOS und Android erstellen~~
2. ✅ ~~Shared API-Vertrag und i18n-Strings anlegen~~
3. Echte API-Authentifizierung in beiden Clients implementieren
4. Offline-Caching und Sync-Logik in shared/data/ aufbauen
5. Erstell-/Bearbeitungsformulare für Tauchgänge und Ausrüstung
6. Push-Benachrichtigungen (APNs / FCM)
7. Google Maps Integration für Android
8. TestFlight / Play Store interne Tests vorbereiten
