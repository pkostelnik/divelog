# 🤿 DiveLog Studio

<div align="center">

![DiveLog Studio](public/assets/Copilot_20260410_212123.png)

**Moderne Dive-Log-Plattform für Gerätetaucher**

Verwalte Tauchgänge, Ausrüstung und Tauchplätze — teile Erlebnisse mit der Community.

🌐 **Live-Demo:** [https://divelog.copilot.ovh](https://divelog.copilot.ovh)

![Screenshot](public/assets/screenshot-landing.png)

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react)](https://react.dev)
[![ESLint](https://img.shields.io/badge/ESLint-10.2-4B32C3?logo=eslint)](https://eslint.org)

</div>

---

> 🇬🇧 English below · 🇩🇪 Deutsche Fassung zuerst

## 🇩🇪 Deutsch

### 🚀 Schnellstart

```bash
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000). Die Landing Page bietet Registrierung, Login, Demo-Zugänge und Zugang zum Dashboard.

### ✨ Highlights

- 🌊 **Tropisches Ozean-Theme** — Farbpalette inspiriert von Korallenriffen, türkisem Wasser und tropischen Tauchplätzen (Hell- & Dunkelmodus)
- 🖼️ **Thematische Bildwelten** — Unterwasser-Hero, Showcase-Galerie und Banner auf allen Dashboard-Seiten
- 🤿 **Avatar-System** — Eigene Avatar-URL oder automatische Gravatar-Integration (SHA-256)
- 🏢 **Microsoft Teams-Integration** — Funktioniert als Web-App und als Teams-App mit automatischer SSO-Erkennung
- 🌐 **Zweisprachig** — Deutsch und Englisch mit persistenter Sprachauswahl
- 🌙 **Dark Mode** — Tiefes Ozean-Teal statt generischem Grau
- 📱 **Responsive Design** — Mobile-first mit Hamburger-Navigation

### 📋 Features

#### Branding & Design
- Illustriertes DiveLog-Branding als zentrales App-, PWA- und Browser-Icon
- 5 Farbpaletten: Ocean, Abyss, Coral, Sand, Reef
- Glasmorphe Header/Footer mit Backdrop-Blur
- Wellenteiler-SVG zwischen Sektionen
- Einheitliche PNG-Icons fuer Browser, Apple Touch und Web App Manifest

#### Authentifizierung & Konto
- Login via E-Mail/Passwort oder Demo-Zugänge (Member/Admin)
- Sprach-Demos (DE/EN) mit automatischer Oberflächenumstellung
- Social-Login-Buttons (Google, Microsoft, Facebook, LinkedIn, Amazon)
- Registrierung mit Live-Passwort-Validierung
- Profil mit Avatar-Einstellungen (Gravatar oder eigene URL)
- Passwort-Reset und Konto-Löschung mit E-Mail-Bestätigung

#### Dashboard-Module
- **Tauchgänge** — Erstellen, Bearbeiten, Sortieren und Filtern von Tauchlog-Einträgen
- **Ausrüstung** — Geräteverwaltung mit Service-Status (bereit/wartung)
- **Tauchplätze** — Galerie mit Schwierigkeitsgrad, interaktive Leaflet-Karte
- **Medien** — Bild-/Video-Galerie mit Lightbox und Upload
- **Community** — Blog-Beiträge mit Kommentaren und Like-System
- **Forum** — Threads mit Kategorien, Antworten und Moderation
- **Mitglieder** — Admin-Verzeichnis mit Inline-Bearbeitung und CRUD
- **Suche** — Echtzeit-Filterung über Tauchgänge, Plätze und Ausrüstung
- **Benachrichtigungen** — Chronologische Timeline mit Dismiss-Funktion

### 🛠️ Tech-Stack

| Technologie | Version | Zweck |
|---|---|---|
| Next.js | 16.2 | App Router, SSR, Turbopack |
| React | 19.2 | UI-Rendering |
| TypeScript | 6.0 | Typsicherheit |
| Tailwind CSS | 4.2 | Utility-first Styling |
| ESLint | 10.2 | Flat Config, Custom Rules |
| Zod | 4.3 | Schema-Validierung |
| Azure Cosmos DB | 4.9 SDK | Datenbank-Backend (optional) |
| PostgreSQL | — | Datenbank-Backend (optional, pg-Paket) |
| MySQL | — | Datenbank-Backend (optional, mysql2-Paket) |
| Teams JS SDK | 2.52 | Microsoft Teams-Integration |
| Leaflet | 1.9 | Interaktive Karten |
| Lucide React | 1.8 | Icon-System |

### 🗄️ Multi-Backend-Architektur

Die App unterstützt **vier Datenbank-Backends**, wählbar über eine einzige Umgebungsvariable:

```env
DB_PROVIDER=mock    # mock | cosmos | postgres | mysql
```

| Provider | Paket | Env-Variablen | Einsatz |
|---|---|---|---|
| `mock` | — (Standard) | keine | Demo, Entwicklung |
| `cosmos` | `@azure/cosmos` | `AZURE_COSMOS_DB_*` | Azure-Produktion |
| `postgres` | `pg` | `DATABASE_URL` | Self-Hosted, AWS, Supabase |
| `mysql` | `mysql2` | `DATABASE_URL` | Self-Hosted, PlanetScale |

**Architektur:**
```
API-Routen → getRepository() → Repository-Interface → Adapter (Cosmos/Postgres/MySQL/Mock)
```

Alle API-Routen rufen `getRepository()` auf — die Factory wählt automatisch den richtigen Adapter. PostgreSQL und MySQL nutzen ein JSONB/JSON-Schema mit automatischer Tabellenerstellung beim ersten Start.

#### Setup: Mock (Standard — keine Konfiguration nötig)
```bash
# .env.local nicht nötig — Mock ist der Default
npm run dev
```

#### Setup: PostgreSQL
```bash
# 1. Paket installieren
npm install pg

# 2. .env.local anlegen
cat >> .env.local << 'EOF'
DB_PROVIDER=postgres
DATABASE_URL=postgres://user:password@localhost:5432/divelog
EOF

# 3. Starten — Tabellen werden automatisch erstellt
npm run dev
```

#### Setup: MySQL
```bash
# 1. Paket installieren
npm install mysql2

# 2. .env.local anlegen
cat >> .env.local << 'EOF'
DB_PROVIDER=mysql
DATABASE_URL=mysql://user:password@localhost:3306/divelog
EOF

# 3. Starten — Tabellen werden automatisch erstellt
npm run dev
```

#### Setup: Azure Cosmos DB
```bash
# .env.local anlegen
cat >> .env.local << 'EOF'
DB_PROVIDER=cosmos
AZURE_COSMOS_DB_ENDPOINT=https://your-account.documents.azure.com:443
AZURE_COSMOS_DB_KEY=your-primary-key
AZURE_COSMOS_DB_DATABASE=divelog
EOF

# Container einrichten (einmalig)
npx ts-node src/scripts/setup-cosmos-containers.ts

npm run dev
```

Detailliertes Cosmos-DB-Setup: [`docs/COSMOS_DB_SETUP.md`](docs/COSMOS_DB_SETUP.md)

### 🧭 Projektstruktur

```
app/                    → Next.js App Router
├── page.tsx            → Landing Page mit Hero, Features, Galerie
├── layout.tsx          → Root Layout mit allen Providern
├── globals.css         → Tropisches Ozean-Theme (Light + Dark)
├── auth/               → Login, Register, Logout
├── dashboard/          → Alle Dashboard-Seiten
│   ├── layout.tsx      → Auth-Guard für geschützte Bereiche
│   ├── page.tsx        → Dashboard-Übersicht mit Hero-Banner
│   ├── dives/          → Tauchgangs-Verwaltung
│   ├── equipment/      → Ausrüstungs-Status
│   ├── sites/          → Tauchplatz-Galerie
│   ├── media/          → Medien-Galerie
│   ├── community/      → Blog + Forum
│   ├── members/        → Mitglieder-Verzeichnis (Admin)
│   ├── profile/        → Persönliches Profil + Avatar
│   └── ...
├── api/                → API-Routen (Mock-Daten)
└── (dashboard)/        → Legacy-Redirects für alte URLs

src/
├── components/         → Wiederverwendbare UI-Komponenten
│   ├── layout/         → Header, Footer
│   └── ui/             → AppLogo, MemberAvatar
├── features/           → Feature-Module
│   ├── auth/           → Login/Register-Formulare, Account-Hooks
│   ├── community/      → Forum-Board, Blog-Highlights, Post-Form
│   ├── dives/          → Tauchlog-Liste, Erstellungsformular
│   ├── equipment/      → Status-Widget
│   ├── media/          → Medien-Grid mit Lightbox
│   ├── members/        → Mitglieder-Verzeichnis
│   ├── notifications/  → Timeline-Widget
│   ├── search/         → Such-Panel
│   └── sites/          → Karte + Galerie
├── providers/          → React Context Provider
│   ├── auth-provider   → Authentifizierung + Mitglieder-CRUD
│   ├── demo-data       → Mock-Daten mit Client-State
│   ├── i18n-provider   → Internationalisierung (DE/EN)
│   ├── teams-provider  → Microsoft Teams-Erkennung
│   └── theme-provider  → Dark/Light Mode
├── lib/                → Hilfsfunktionen
│   ├── cosmos-db.ts    → Azure Cosmos DB Client (2-Container)
│   ├── gravatar.ts     → Gravatar SHA-256 Integration
│   └── ...
├── data/               → Mock-Daten (Cosmos DB Modell)
└── i18n/               → Übersetzungen (DE + EN)

proxy.ts                → Rate-Limiting + CSRF-Schutz
tailwind.config.ts      → 5-Farben Ozean-Palette
```

### 🧪 Entwicklung

```bash
npm run dev       # Dev-Server mit Hot Reload
npm run lint      # ESLint (Flat Config)
npm run typecheck # TypeScript Strict Mode
npm run build     # Produktions-Build
npm run start     # Produktiv-Server
```

### 📦 Demo-Daten

- Alle Daten leben im Client-State (`DemoDataProvider`)
- Auth ist clientseitig (`AuthProvider`) — nicht persistent
- Social Buttons starten Demo-Anmeldungen (LinkedIn → Admin)
- Konto-Löschung bereinigt zugehörige Inhalte

### 🔗 Microsoft Teams

Die App erkennt Teams automatisch via `@microsoft/teams-js`:

| Feature | Web-Modus | Teams-Modus |
|---|---|---|
| Landing Page | ✅ Vollständig | ↪️ Redirect zu Dashboard |
| Authentifizierung | Manuell | SSO (automatisch) |
| Header | Vollständig | Ausgeblendet |
| Theme | Light/Dark Toggle | Übernimmt Teams-Theme |

Setup: Siehe [`teams-app/README.md`](teams-app/README.md)

### ⚙️ URL-Konfiguration

Alle plattformübergreifenden URLs werden zentral verwaltet — ein Domain-Wechsel erfordert nur minimale Änderungen:

| Plattform | Konfigurationsdatei | Variable / Feld |
|---|---|---|
| Web (Next.js) | `.env.local` | `NEXT_PUBLIC_SITE_URL` |
| Capacitor (iOS/Android) | `capacitor.config.ts` | liest `NEXT_PUBLIC_SITE_URL` |
| Electron (macOS/Windows) | `electron/main.js` | liest `NEXT_PUBLIC_SITE_URL` |
| iOS Nativ | `Clients/ios/DiveLog/AppConfig.swift` | `AppConfig.siteURL` |
| Android Nativ | `Clients/android/.../AppConfig.kt` | `AppConfig.SITE_URL` |
| Teams Manifest | `teams-app/manifest.json` + `env/.env.dev` | `${{SITE_URL}}` (Platzhalter) |

Zentrale Konfigurationsdatei: [`src/lib/config.ts`](src/lib/config.ts)

### 🔐 Sicherheit

- Rate-Limiting (in-memory, IP-basiert) via Proxy
- CSRF-Schutz für mutating API-Requests
- Security-Header (X-Frame-Options, CSP, HSTS)
- Avatar-URLs nur über HTTPS erlaubt
- npm audit: 0 bekannte Schwachstellen

### � Native Clients

Neben der Web-App werden native Mobile-Clients entwickelt:

| Plattform | Technologie | Architektur | Stand |
|---|---|---|---:|
| iOS / iPadOS | Swift 6 + SwiftUI | MVVM | 10% |
| Android | Kotlin + Jetpack Compose | MVVM | 10% |
| macOS | SwiftUI | MVVM | Geplant |
| Windows | WinUI 3 / .NET | MVVM | Geplant |

Alle Clients teilen:
- Gemeinsame Domain-Modelle und API-Vertrag (`Clients/shared/`)
- Zweisprachige Strings (DE/EN) als JSON
- Dieselbe REST-API (`/api/*`)

iOS und iPadOS sind **eine gemeinsame App** — SwiftUI passt das Layout automatisch an (iPhone: TabView, iPad: NavigationSplitView).

Details: [`Clients/README.md`](Clients/README.md)

### 🔮 Roadmap

1. Azure Cosmos DB anbinden (2-Container-Architektur vorbereitet)
2. NextAuth / Entra ID für serverseitige Authentifizierung
3. React Hook Form + Zod Server Actions
4. Azure Blob Storage für Medienverwaltung
5. Playwright E2E-Tests + CI/CD Pipeline
6. Erweiterte Teams-Features (Bot, Adaptive Cards)
7. iOS / Android App Store Releases

---

## 🇬🇧 English

🌐 **Live Demo:** [https://divelog.copilot.ovh](https://divelog.copilot.ovh)

### 🚀 Quickstart

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The landing page links to registration, login, demo accounts, and the full dashboard.

### ✨ Highlights

- 🌊 **Tropical ocean theme** — Color palette inspired by coral reefs, turquoise waters, and tropical dive sites (light & dark mode)
- 🖼️ **Thematic imagery** — Underwater hero, showcase gallery, and banners across all dashboard pages
- 🤿 **Avatar system** — Custom avatar URL or automatic Gravatar integration (SHA-256)
- 🏢 **Microsoft Teams integration** — Works as web app and Teams app with automatic SSO detection
- 🌐 **Bilingual** — German and English with persistent language selection
- 🌙 **Dark mode** — Deep ocean teal instead of generic gray
- 📱 **Responsive design** — Mobile-first with hamburger navigation

### 📋 Features

#### Dashboard Modules
- **Dive logs** — Create, edit, sort, and filter dive entries
- **Equipment** — Gear management with service status
- **Dive sites** — Gallery with difficulty ratings and interactive Leaflet map
- **Media** — Image/video gallery with lightbox and upload
- **Community** — Blog posts with comments and like system
- **Forum** — Threaded discussions with categories and moderation
- **Members** — Admin directory with inline editing
- **Search** — Real-time filtering across dives, sites, and equipment
- **Notifications** — Chronological timeline with dismiss

#### Authentication
- Email/password login with demo accounts (member/admin)
- Language demos (DE/EN) with automatic UI switch
- Social login buttons (Google, Microsoft, Facebook, LinkedIn, Amazon)
- Profile with avatar settings (Gravatar or custom URL)
- Password reset and account deletion with email confirmation

### 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.2 | App Router, SSR, Turbopack |
| React | 19.2 | UI rendering |
| TypeScript | 6.0 | Type safety |
| Tailwind CSS | 4.2 | Utility-first styling |
| ESLint | 10.2 | Flat config, custom rules |
| Zod | 4.3 | Schema validation |
| Azure Cosmos DB | 4.9 SDK | Database backend (optional) |
| PostgreSQL | — | Database backend (optional, pg) |
| MySQL | — | Database backend (optional, mysql2) |
| Teams JS SDK | 2.52 | Microsoft Teams integration |
| Leaflet | 1.9 | Interactive maps |
| Lucide React | 1.8 | Icon system |

### 🗄️ Multi-Backend Architecture

The app supports **four database backends**, selectable via a single environment variable:

```env
DB_PROVIDER=mock    # mock | cosmos | postgres | mysql
```

| Provider | Package | Env Variables | Use Case |
|---|---|---|---|
| `mock` | — (default) | none | Demo, development |
| `cosmos` | `@azure/cosmos` | `AZURE_COSMOS_DB_*` | Azure production |
| `postgres` | `pg` | `DATABASE_URL` | Self-hosted, AWS, Supabase |
| `mysql` | `mysql2` | `DATABASE_URL` | Self-hosted, PlanetScale |

#### Setup: PostgreSQL
```bash
npm install pg
echo 'DB_PROVIDER=postgres' >> .env.local
echo 'DATABASE_URL=postgres://user:pass@localhost:5432/divelog' >> .env.local
npm run dev   # tables are created automatically
```

#### Setup: MySQL
```bash
npm install mysql2
echo 'DB_PROVIDER=mysql' >> .env.local
echo 'DATABASE_URL=mysql://user:pass@localhost:3306/divelog' >> .env.local
npm run dev   # tables are created automatically
```

#### Setup: Azure Cosmos DB
See [`docs/COSMOS_DB_SETUP.md`](docs/COSMOS_DB_SETUP.md)

### 🔐 Security

- Rate limiting (in-memory, IP-based) via proxy middleware
- CSRF protection for mutating API requests
- Security headers (X-Frame-Options, CSP, HSTS)
- Avatar URLs restricted to HTTPS only
- npm audit: 0 known vulnerabilities
### ⚙️ URL Configuration

All cross-platform URLs are managed centrally — a domain change requires only minimal edits:

| Platform | Config File | Variable / Field |
|---|---|---|
| Web (Next.js) | `.env.local` | `NEXT_PUBLIC_SITE_URL` |
| Capacitor (iOS/Android) | `capacitor.config.ts` | reads `NEXT_PUBLIC_SITE_URL` |
| Electron (macOS/Windows) | `electron/main.js` | reads `NEXT_PUBLIC_SITE_URL` |
| iOS Native | `Clients/ios/DiveLog/AppConfig.swift` | `AppConfig.siteURL` |
| Android Native | `Clients/android/.../AppConfig.kt` | `AppConfig.SITE_URL` |
| Teams Manifest | `teams-app/manifest.json` + `env/.env.dev` | `${{SITE_URL}}` (placeholder) |

Central config module: [`src/lib/config.ts`](src/lib/config.ts)
### � Native Clients

In addition to the web app, native mobile clients are being developed:

| Platform | Technology | Architecture | Progress |
|---|---|---|---:|
| iOS / iPadOS | Swift 6 + SwiftUI | MVVM | 10% |
| Android | Kotlin + Jetpack Compose | MVVM | 10% |
| macOS | SwiftUI | MVVM | Planned |
| Windows | WinUI 3 / .NET | MVVM | Planned |

All clients share:
- Common domain models and API contract (`Clients/shared/`)
- Bilingual strings (DE/EN) as JSON
- The same REST API (`/api/*`)

iOS and iPadOS are **a single app** — SwiftUI adapts the layout automatically (iPhone: TabView, iPad: NavigationSplitView).

Details: [`Clients/README.md`](Clients/README.md)

### 🔮 Roadmap

1. Connect Azure Cosmos DB (2-container architecture prepared)
2. NextAuth / Entra ID for server-side authentication
3. React Hook Form + Zod Server Actions
4. Azure Blob Storage for media management
5. Playwright E2E tests + CI/CD pipeline
6. Enhanced Teams features (bot, adaptive cards)
7. iOS / Android App Store releases

---

<div align="center">

**Built with 🤿 by DiveLog Studio Team**

</div>
