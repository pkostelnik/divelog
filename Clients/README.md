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

## Nächste Schritte
1. Architekturentscheid finalisieren (pro Plattform und Shared-Strategie).
2. Mindestumfang pro Client definieren (MVP-Scope).
3. Erste App-Skelette in ios/, android/ und windows/ aufsetzen.
4. Shared-Domain und API-Client als erstes wiederverwendbares Paket implementieren.
