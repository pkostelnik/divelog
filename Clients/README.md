# DiveLog Clients

## Überblick
Dieses Verzeichnis enthält die geplanten Client-Anwendungen für verschiedene Zielplattformen sowie einen gemeinsamen Shared-Bereich.

Die Prozentwerte sind als grobe Projektsteuerung gedacht und werden bei jedem relevanten Fortschritt aktualisiert.

## Client-Übersicht

| Plattform | Form | Pfad | Entwicklungsstand | Status |
|---|---|---|---:|---|
| Web | PWA (bestehende Next.js-Webapp, außerhalb von Clients) | ../ | 75% | In Betrieb / laufende Weiterentwicklung |
| iOS / iPadOS (Capacitor) | Native Shell + WebView (Capacitor) | ../ios/ | 15% | Plattform generiert |
| Android (Capacitor) | Native Shell + WebView (Capacitor) | ../android/ | 15% | Plattform generiert |
| iOS / iPadOS (Nativ) | Nativ (SwiftUI) — eine gemeinsame App für iPhone und iPad | ios/ | 10% | App-Skelett erstellt |
| Android (Nativ) | Nativ (Kotlin + Jetpack Compose) | android/ | 10% | App-Skelett erstellt |
| macOS (Electron) | Desktop Shell + WebView (Electron) | ../electron/ | 15% | App-Shell erstellt |
| Windows (Electron) | Desktop Shell + WebView (Electron) | ../electron/ | 15% | App-Shell erstellt |
| macOS (Nativ) | Nativ (SwiftUI/AppKit je nach Bedarf) | macos/ | 0% | Geplant |
| Windows (Nativ) | Nativ (WinUI 3 / .NET) | windows/ | 0% | Geplant |
| Shared Components | Wiederverwendbare Logik, UI-Bausteine, Typen, Services | shared/ | 15% | API-Vertrag + i18n Strings |

## Capacitor (PWA-Wrapper)

Die schnellste Variante für native App-Store-Releases: [Capacitor](https://capacitorjs.com/) verpackt die bestehende Next.js-Webapp in einen nativen Container.

- Konfiguration: `../capacitor.config.ts`
- iOS-Projekt: `../ios/` (Xcode)
- Android-Projekt: `../android/` (Android Studio)
- Modus: Remote-URL — lädt `https://divelog.copilot.ovh` in einer nativen Shell
- Native Plugins: SplashScreen, StatusBar, App (Deep Links)

**Befehle:**
```bash
npm run cap:sync              # Web-Assets + Plugins synchronisieren
npm run cap:open:ios          # In Xcode öffnen
npm run cap:open:android      # In Android Studio öffnen
npm run cap:run:ios           # Auf iOS-Simulator starten
npm run cap:run:android       # Auf Android-Emulator starten
```

## Electron (Desktop-Wrapper)

Für macOS und Windows verwendet das Projekt [Electron](https://www.electronjs.org/) als nativen Desktop-Container.

- Hauptprozess: `../electron/main.js`
- Modus: Remote-URL — lädt `https://divelog.copilot.ovh`
- macOS: `hiddenInset`-Titelleiste, natives Menü (Bearbeiten, Ansicht, Fenster)
- Windows: Standard-Titelleiste mit Installer (NSIS) und Portable-Build
- Build-Ausgabe: `../dist-electron/`

**Befehle:**
```bash
npm run electron:dev          # Electron-Fenster starten (Entwicklung)
npm run electron:build:mac    # macOS DMG + ZIP erzeugen
npm run electron:build:win    # Windows Installer + Portable erzeugen
npm run electron:build:all    # Beide Plattformen bauen
```

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
3. ✅ ~~Capacitor-Integration für PWA-Wrapper (iOS + Android)~~
4. Echte API-Authentifizierung in beiden Clients implementieren
5. Offline-Caching und Sync-Logik in shared/data/ aufbauen
6. Erstell-/Bearbeitungsformulare für Tauchgänge und Ausrüstung
7. Push-Benachrichtigungen (APNs / FCM)
8. Google Maps Integration für Android
9. TestFlight / Play Store interne Tests vorbereiten
