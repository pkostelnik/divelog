# DiveLog Studio Demo

![DiveLog Studio Screenshot](public/assets/DiveLogStudio.png)

> :uk: English content first · :de: Deutsche Fassung folgt weiter unten.

## :uk: English

### 🚀 Quickstart
```bash
npm install
npm run dev
```
Then open `http://localhost:3000`. The landing page links straight to registration, login, mock social sign-ins, and the full dashboard.

### ✨ Highlights
- Refined landing page with clear calls to action (registration, login, demo)
- Social sign-in buttons for Google, Microsoft, Facebook, LinkedIn & Amazon (demo flow)
- Registration flow with real-time password confirmation and cancel option
- Password reset with validation plus account deletion and content purge
- Community, dive log, and equipment modules powered by responsive mock data

#### A Glimpse Inside The App
- Hero, feature tiles, and demo navigation at a glance
- Dashboard covering community, dive, and equipment modules
- Responsive layout illustrating mobile and desktop views

### 📋 Feature Overview
**Landing & Marketing**
- Hero section listing the tech stack, calls to action, and supporting content
- Feature tiles for dive logs, equipment, members, and community
- “Everything for your team” spotlight highlighting auth and UX workflows

**Authentication & Account**
- Login via email/password, demo access, and social buttons
- Registration with double password entry and live mismatch feedback
- Account dashboard for password reset and account deletion (email confirmation)
- Demo data is anonymised or replaced when accounts are removed

**Dashboard Modules**
- Dive logs with filters, sequential numbers, and an add form
- Equipment, sites, community, and notifications sections with mock content
- Community posts supporting attachments, overlays, and forum entry points

### 🛠️ Tech Stack & Versions

| Technology                   | Version |
| ---------------------------- | ------- |
| Next.js                      | 16.0.1  |
| React                        | 18.3.0  |
| TypeScript                   | 5.5.3   |
| Tailwind CSS                 | 3.4.10  |
| eslint / eslint-config-next  | 9.5.0 / 16.0.1 |
| Zod                          | 3.23.0  |
| @tanstack/react-query        | 5.45.0  |

Additional libraries: `lucide-react`, `clsx`, `react-simple-maps`, `@tailwindcss/forms`.

### 🧭 Project Structure
- `app/` – App Router pages, layouts, and API stubs
- `app/page.tsx` – landing page
- `app/auth/*` – login, logout, and registration screens
- `src/features/*` – feature components (auth, community, dives, etc.)
- `src/providers/*` – state management for auth and demo data
- `src/data/mock-data.ts` – mock datasets including sequences and attachments
- `src/features/auth/components/social-providers.tsx` – reusable social login assets

### 🧪 Development Workflow
Available npm scripts:
```bash
npm run dev       # Dev server with hot reload
npm run lint      # ESLint for TS/TSX
npm run build     # Production build
npm run start     # Production server after build
npm run typecheck # TypeScript strict mode without emit
```
Recommendation: keep `npm run dev` running during development and lint frequently.

### 📦 Demo Data & Behaviour
- All data originates from `src/data/mock-data.ts` and lives on the client
- Auth flows rely on local state via `AuthProvider` (non-persistent)
- Social buttons trigger demo sign-ins (LinkedIn → admin, others → member)
- Account deletion purges logs, media, and community content while replacing blog/forum posts with placeholders

### 🔮 Roadmap
1. Integrate Azure Cosmos DB (module containers, user/team partition keys)
2. Connect NextAuth or Entra ID for production social logins
3. Migrate forms to React Hook Form + Zod with server-side mutations
4. Add persistent media handling via Azure Storage / Blob Storage
5. Introduce Playwright E2E tests and CI/CD integration

### Closing Note
The demo gives product, design, and engineering teams a tangible preview of DiveLog Studio's experience—including core account flows, social sign-ins, and an Azure-ready architecture.

---

## :de: Deutsch

### 🚀 Schnellstart
```bash
npm install
npm run dev
```
Öffne danach `http://localhost:3000`. Die Landing Page verweist auf Registrierung, Login, Social Logins (Mock) sowie das Dashboard.

### ✨ Highlights
- Überarbeitete Landing Page mit klaren Calls-to-Action (Registrierung, Login, Demo)
- Social Sign-In Buttons für Google, Microsoft, Facebook, LinkedIn & Amazon (Demo-Flow)
- Registrierung mit Passwort-Bestätigung in Echtzeit und Cancel-Option
- Passwort-Reset samt Validierung und Konto-Löschung inklusive Content-Purge
- Module für Community, Dive Logs und Equipment auf Basis responsiver Mock-Daten

#### Blick in die App
- Hero, Feature-Kacheln und Demo-Navigation auf einen Blick
- Dashboard mit Community-, Dive- und Equipment-Modulen
- Responsive Layout demonstriert Mobile- und Desktop-Ansicht

### 📋 Feature-Überblick
**Landing & Marketing**
- Hero mit Technologie-Stack, Call-to-Actions und erklärendem Secondary-Content
- Feature-Kacheln für Dive Logs, Equipment, Mitglieder und Community
- „Alles für dein Team“-Sektion mit Fokus auf Auth- und UX-Workflows

**Authentifizierung & Konto**
- Login via E-Mail/Passwort, Demo-Zugänge sowie Social Buttons
- Registrierung mit doppelter Passworteingabe und Live-Feedback
- Account-Dashboard für Passwort-Reset und Konto-Löschung (mit E-Mail-Bestätigung)
- Demo-Daten werden bei Konto-Löschung anonymisiert bzw. ersetzt

**Dashboard-Module**
- Dive Logs mit Filteroptionen, Lognummern und Formular zum Hinzufügen
- Equipment-, Site-, Community- und Notifications-Bereiche samt Mock-Content
- Community-Posts mit Attachment-Uploads, Overlays und Foren-Verlinkungen

### 🛠️ Tech-Stack & Versionen

| Technologie                  | Version |
| ---------------------------- | ------- |
| Next.js                      | 16.0.1  |
| React                        | 18.3.0  |
| TypeScript                   | 5.5.3   |
| Tailwind CSS                 | 3.4.10  |
| eslint / eslint-config-next  | 9.5.0 / 16.0.1 |
| Zod                          | 3.23.0  |
| @tanstack/react-query        | 5.45.0  |

Weitere Bibliotheken: `lucide-react`, `clsx`, `react-simple-maps`, `@tailwindcss/forms`.

### 🧭 Projektstruktur
- `app/` – App Router Seiten, Layouts und API-Stubs
- `app/page.tsx` – Landing Page
- `app/auth/*` – Login-, Logout- und Registrierungsseiten
- `src/features/*` – Feature-Komponenten (Auth, Community, Dives usw.)
- `src/providers/*` – State-Management für Auth & Demo-Daten
- `src/data/mock-data.ts` – Mock-Datensätze inklusive Sequenzen und Attachments
- `src/features/auth/components/social-providers.tsx` – Social-Login-Assets

### 🧪 Entwicklungs-Workflow
Verfügbare NPM-Skripte:
```bash
npm run dev       # Entwicklerserver mit Hot Reload
npm run lint      # ESLint für TS/TSX
npm run build     # Produktions-Build
npm run start     # Produktiv-Server nach dem Build
npm run typecheck # TypeScript ohne Emit im Strict-Modus
```
Empfehlung: Während der Entwicklung `npm run dev` verwenden und regelmäßig `npm run lint` ausführen.

### 📦 Demo-Daten & Verhalten
- Alle Daten stammen aus `src/data/mock-data.ts` und bleiben clientseitig
- Auth-Flows nutzen einen lokalen State (`AuthProvider`) und sind nicht persistent
- Social Buttons starten Demo-Anmeldungen (LinkedIn → Admin, andere → Member)
- Konto-Löschungen bereinigen Logs, Medien und Community-Inhalte; Blog/Forum erhalten Platzhalter

### 🔮 Nächste Schritte
1. Azure Cosmos DB integrieren (Container pro Modul, Partition Keys pro Nutzer/Team)
2. NextAuth oder Entra ID für echte Social Logins anbinden
3. Formulare auf React Hook Form + Zod mit serverseitigen Mutationen umstellen
4. Persistente Medienverwaltung via Azure Storage / Blob Storage
5. E2E-Tests mit Playwright und CI/CD-Integration

### Schlusswort
Die Demo vermittelt Produktteams, Design und Engineering das geplante Erlebnis von DiveLog Studio – inklusive zentraler Account-Flows, Social Sign-Ins und einer Azure-ready Architektur.
