# Dive Log Web Application Architecture

## 1. High-Level Overview
- **Framework**: Next.js 15 with the App Router for hybrid SSR/SSG rendering.
- **Language**: TypeScript across client, server, and shared modules to enforce type safety.
- **Styling**: Tailwind CSS with PostCSS for utility-first styling and rapid prototyping.
- **Data Platform**: Azure Cosmos DB (SQL API) with a hierarchical partition strategy to support multi-tenant and user-centric workloads.
- **Authentication**: OAuth 2.0/OpenID Connect via a managed provider (e.g., Azure AD B2C, Auth0) integrated through NextAuth.js.
- **APIs**: Server Actions and Route Handlers under `app/api` for domain-specific endpoints alongside Next.js server components.
- **State Management**: Lightweight client state via React Query/TanStack Query; server state resolved within server components.
- **Observability**: Application Insights (client + server) for telemetry, Cosmos DB diagnostics logging for data layer insights.

## 2. Layered Architecture
1. **Presentation Layer**
   - Route groups for marketing, authenticated dashboard, and admin tooling.
   - Reusable UI components (`src/components`) built with Tailwind CSS, Radix UI, and headless primitives.
   - Form handling via React Hook Form + Zod for schema validation.
2. **Application Layer**
  - Feature modules encapsulated inside `src/features/<domain>` (DiveLogs, Equipment, Sites, Media, Community, Notifications, Search).
   - Each feature exposes hooks, services, and UI composites.
3. **Domain Layer**
   - Domain models and Zod schemas in `src/domain`.
   - Business rules captured as service classes or pure functions in `src/services`.
4. **Infrastructure Layer**
   - Cosmos DB repositories, storage adapters (e.g., Azure Blob Storage), messaging integrations (SignalR/Azure Web PubSub) located under `src/infrastructure`.
   - Shared utility helpers under `src/lib`.

## 3. Directory Structure
```
app/
  layout.tsx                # Root layout and providers
  page.tsx                  # Landing page
  (marketing)/              # Public marketing pages
  (auth)/                   # Auth routes (sign-in/out callbacks)
  (dashboard)/              # Authenticated shell
    layout.tsx
    page.tsx
    dives/
      page.tsx
    equipment/
      page.tsx
    sites/
      page.tsx
    media/
      page.tsx
    community/
      page.tsx
    notifications/
      page.tsx
  api/
    auth/[...nextauth]/route.ts
    dives/
      route.ts
    equipment/
      route.ts
    sites/
      route.ts
    media/
      route.ts
    community/
      route.ts
    notifications/
      route.ts

src/
  components/
    ui/                     # Design system primitives
    layout/                 # Shell components, navigation, footer
    charts/                 # D3/Recharts visualizations
  features/
    dives/
      hooks/
      components/
      services/
    equipment/
    sites/
    media/
    community/
    notifications/
    search/
  domain/
    dives.ts
    equipment.ts
    sites.ts
    media.ts
    community.ts
    notifications.ts
    user.ts
  services/
    auth/
    dives/
    equipment/
    notifications/
    search/
  infrastructure/
    cosmos/
      client.ts             # Cosmos client singleton
      repositories/
        divesRepository.ts
        equipmentRepository.ts
        sitesRepository.ts
        mediaRepository.ts
        communityRepository.ts
        notificationsRepository.ts
    storage/
      blobStorage.ts
    messaging/
      realtimeHub.ts
  lib/
    env.ts                  # Runtime env loader (no secrets hard-coded)
    logger.ts
    telemetry.ts
    validation.ts
  styles/
    globals.css
    tailwind.css

config/
  cosmos/
    database.json           # Non-secret config (e.g., container names)
  feature-flags.json

public/
  assets/                   # Static images/icons
  locales/                  # i18n resources

scripts/
  seed.ts                   # Seed data for local/dev
  migrate.ts                # Migration helpers

docs/
  architecture.md
  data-model.md             # Detailed schema design

.env.example                # Placeholder for env variables
.env.local                  # Git-ignored; developer-specific secrets
```

## 4. Data Modeling (Azure Cosmos DB)
- **Partition Strategy**: Use hierarchical partition keys (`/tenantId/userId`) to balance load across tenants and enable targeted queries per user.
- **Containers**:
  - `Users` (PK: `/tenantId/userId`)
  - `DiveLogs` (PK: `/tenantId/userId`)
  - `Equipment` (PK: `/tenantId/userId`)
  - `Sites` (PK: `/tenantId/siteId`)
  - `Media` (PK: `/tenantId/mediaId`)
  - `CommunityPosts` (PK: `/tenantId/threadId`)
  - `Notifications` (PK: `/tenantId/userId`)
- **Embedding vs Referencing**:
  - Embed read-heavy sub-documents such as dive metrics and gear snapshots within `DiveLogs`.
  - Reference media blobs via `mediaId` and store metadata plus storage URLs in the `Media` container.
- **Consistency & Availability**: Start with session consistency; enable multi-region writes for global deployments. Utilize throughput autoscale per container to manage RU consumption.
- **Diagnostics**: Capture and log `CosmosDiagnostics` for latency anomalies; integrate with Azure Monitor for RU usage tracking.

## 5. Security & Secrets Management
- **Environment Variables**: Store all secrets (Cosmos DB keys, OAuth secrets, storage keys) in `.env.local` (never committed). Provide placeholders in `.env.example`.
- **Runtime Loading**: Use a centralized loader (`src/lib/env.ts`) that validates required variables via Zod schemas.
- **Key Rotation**: Document procedures via Azure Key Vault and automate with GitHub Actions secrets for deployment.
- **Client vs Server Separation**: Only expose non-sensitive config through Next.js public env variables (`NEXT_PUBLIC_*`). Server-only values remain in process env.

## 6. DevOps & Deployment
- **CI/CD**: GitHub Actions workflow for lint, test, build, and deploy stages. Deploy to Azure Static Web Apps or Azure App Service (Next.js SSR) with managed identity access to Cosmos DB.
- **Infrastructure as Code**: Bicep templates for Cosmos DB, storage accounts, App Service plan, and related resources.
- **Testing Strategy**:
  - Unit tests with Vitest under `src/**/__tests__`.
  - Integration tests using Playwright for critical user flows.
  - Contract tests for API routes with Supertest.
- **Local Development**: Cosmos DB Emulator (Docker) and Azure Storage Emulator (Azurite) for offline development. Provide `docker-compose.yml` to orchestrate dependencies.

## 7. Next Steps
1. Scaffold Next.js project with the above structure (`npx create-next-app@latest`).
2. Implement `src/lib/env.ts` to centralize environment validation.
3. Build out feature modules iteratively, starting with authentication and dive log CRUD.
4. Set up Cosmos DB emulator and seed scripts (`scripts/seed.ts`).
5. Create IaC templates and GitHub Actions workflows for automated deployments.
