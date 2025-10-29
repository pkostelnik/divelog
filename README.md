# DiveLog Studio Demo

Clientseitige Demo einer modernen Dive-Log-Webanwendung auf Basis von Next.js 15, TypeScript und Tailwind CSS. Es werden ausschließlich Mock-Daten verwendet – keine Azure Cosmos DB und kein Azure Storage.

## Quickstart

```bash
npm install
npm run dev
```

Öffne danach `http://localhost:3000`, um das Marketing-Landing sowie das Dashboard mit Demo-Daten zu testen.

## Features in der Demo
- Landing Page mit CTA und Feature-Highlights
- Authentifiziertes Dashboard (Layout) mit Navigation
- Module: Dive Logs, Equipment, Dive Sites, Media, Community, Notifications
- Clientseitige Such- und Filteransicht für Dive Logs
- API-Stub-Routen unter `app/api/*`, die denselben Mock-Datensatz liefern
- Footer-Seiten für Impressum und Datenschutzhinweise (Demo-Inhalte)

## Daten & Architektur
- Mock-Daten in `src/data/mock-data.ts`
- Komponenten pro Feature in `src/features/*`
- Layout- und UI-Bausteine in `src/components`
- Tailwind-Konfiguration und globale Styles unter `tailwind.config.ts` und `app/globals.css`

## Nächste Schritte
1. Cosmos DB und Azure Storage-Integrationen implementieren (Repositories + SDKs).
2. Authentifizierung über NextAuth mit realem Provider anbinden.
3. Formulare mit React Hook Form + Zod ergänzen, um CRUD-Flows zu ermöglichen.
4. E2E-Tests mit Playwright aufsetzen.
