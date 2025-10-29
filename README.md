# DiveLog Studio Demo

Clientseitige Referenzimplementierung einer modernen Dive-Log-Plattform. Die App zeigt das geplante Nutzererlebnis rund um Registrierung, Social Sign-In, Konto-Verwaltung und inhaltsreiche Dashboards – komplett auf Mock-Daten, ohne Backend oder echte Auth-Provider.

## 🚀 Quickstart

```bash
npm install
npm run dev
```

Danach `http://localhost:3000` öffnen. Die Landing Page führt direkt zu Registrierung, Login, Social Logins (Mock) und dem voll ausgestatteten Dashboard.

## ✨ Highlights
- Überarbeitete Landing Page mit klaren CTAs (Registrierung, Login, Demo)
- Social Sign-In Buttons für Google, Microsoft, Facebook, LinkedIn & Amazon (Demo-Flow)
- Registrierungs-Workflow mit Passwort-Bestätigung in Echtzeit und Abbrechen-Funktion
- Passwort-Reset inkl. Validierung sowie Konto-Löschung mit Bestätigungsworkflow und Content-Purge
- Community-, Dive-Log- und Equipment-Module mit Mock-Daten und responsivem UI

## 📋 Feature-Überblick

**Landing & Marketing**
- Hero mit Technologie-Stack, Call-to-Actions und erklärendem Secondary-Content
- Feature-Kacheln zu Dive Logs, Equipment, Mitglieder und Community
- "Alles für dein Team"-Sektion, die neue Auth- und UX-Workflows hervorhebt

**Authentifizierung & Konto**
- Login-Formular mit E-Mail/Passwort, Demo-Logins sowie Social-Buttons
- Registrierung mit doppelt eingegebenem Passwort (Live-Mismatch-Feedback) und Cancel-Flow
- Account-Dashboard zum Zurücksetzen des Passworts und Löschen des Kontos (mit E-Mail-Bestätigung)
- Demo-Daten werden bei Account-Löschung anonymisiert oder entfernt (außer Blog/Forum via Platzhalter)

**Dashboard-Module**
- Dive Logs mit Filteroptionen, Lognummern und Add-Formular
- Equipment-, Site-, Community- und Notifications-Bereiche mit Mock-Content
- Community-Posts mit Attachment-Uploads, Overlay-Previews und Foren-Einstiegen

## 🛠️ Tech-Stack & Versionen

| Technologie            | Version  |
| ---------------------- | -------- |
| Next.js                | 16.0.1   |
| React                  | 18.3.0   |
| TypeScript             | 5.5.3    |
| Tailwind CSS           | 3.4.10   |
| eslint / eslint-config-next | 9.5.0 / 16.0.1 |
| Zod                    | 3.23.0   |
| @tanstack/react-query  | 5.45.0   |

Weitere Bibliotheken: `lucide-react`, `clsx`, `react-simple-maps`, `@tailwindcss/forms`.

## 🧭 Projektstruktur

- `app/` – App Router Seiten, Layouts, API-Stubs
- `app/page.tsx` – überarbeitete Landing Page
- `app/auth/*` – Login- und Registrierungsansichten
- `src/features/*` – Feature-spezifische Komponenten (Auth, Community, Dives, …)
- `src/providers/*` – Demo-State-Management (Auth, Demo-Daten)
- `src/data/mock-data.ts` – Mock-Datensätze inkl. Sequenzen & Attachments
- `src/features/auth/components/social-providers.tsx` – Reusable Social-Login-Assets

## 🧪 Entwicklungs-Workflow

Verfügbare NPM-Skripte:

```bash
npm run dev      # Entwicklerserver mit Hot Reload
npm run lint     # ESLint (TS/TSX)
npm run build    # Next.js Produktions-Build
npm run start    # Startet den Produktions-Server (nach Build)
npm run typecheck# TypeScript im Strict-Modus ohne Emit
```

Empfehlung: Während der Entwicklung `npm run dev` nutzen und Änderungen regelmäßig mit `npm run lint` prüfen.

## 📦 Demo-Daten & Verhalten
- Alle Daten stammen aus `src/data/mock-data.ts` und werden clientseitig verwaltet
- Auth-Flows nutzen einen lokalen State (`AuthProvider`) und sind nicht persistent
- Social Login Buttons triggern Demo-Anmeldungen (LinkedIn → Admin, andere → Member)
- Konto-Löschungen säubern alle nutzerspezifischen Log-, Media- und Community-Inhalte und ersetzen Blog/Forum-Einträge durch Platzhalter

## 🔮 Nächste Schritte (Roadmap)
1. Azure Cosmos DB einbinden (Container pro Modul, Partition Keys nach Nutzer/Team)
2. NextAuth oder Entra ID für echte Social Logins integrieren
3. Formulare auf React Hook Form + Zod Validierungen umstellen (mit serverseitigen Mutationen)
4. Persistente Medienverwaltung via Azure Storage / Blob Storage ergänzen
5. E2E-Tests mit Playwright und CI/CD-Integration

---

Die Demo soll Produktteams, Design und Engineering einen klaren Eindruck vermitteln, wie sich DiveLog Studio im produktiven Einsatz anfühlen wird – inklusive der zentralen Account-Flows, Social Sign-Ins und moderner Azure-Ready-Architektur.
