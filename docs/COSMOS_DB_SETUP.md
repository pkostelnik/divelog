# Azure Cosmos DB - 2-Container-Architektur

## Übersicht

Die DiveLog Studio App nutzt Azure Cosmos DB mit einer **2-Container-Architektur**:

### Container 1: `users-and-social`
- **Partition Key**: `/userId` (hierarchisch)
- **Entities**:
  - Users (type: "user")
  - Notifications (type: "notification")
  - Friends (type: "friend")
  - Messages (type: "message")

### Container 2: `dive-content`
- **Partition Key**: `/ownerId` (hierarchisch)
- **Entities**:
  - Dives (type: "dive")
  - Equipment (type: "equipment")
  - Media (type: "media")
  - Sites (type: "site")
  - Blogs (type: "blog")
  - Forum Posts (type: "forum")

## Vorteile dieser Architektur

1. **Kosteneffizienz**: Nur 2 Container statt 10+ → weniger RU-Verbrauch
2. **Hierarchische Partition Keys**: Umgeht 20GB Limit pro logischer Partition
3. **Optimierte Queries**: Alle Daten eines Users in einer Partition
4. **Type Discriminator**: Einfache Filterung nach Entity-Typ

## Setup

### 1. Umgebungsvariablen konfigurieren

Kopiere `.env.production.example` zu `.env.local` und fülle aus:

```bash
COSMOS_ENDPOINT=https://your-account.documents.azure.com:443/
COSMOS_KEY=your-primary-or-secondary-key
COSMOS_DATABASE_NAME=divelog-prod
```

### 2. Container erstellen

Führe das Setup-Skript aus:

```bash
npx tsx src/scripts/setup-cosmos-containers.ts
```

Dies erstellt:
- Database: `divelog-prod`
- Container: `users-and-social` (partitionKey: /userId)
- Container: `dive-content` (partitionKey: /ownerId)

## Datenmodelle

Alle Entities haben folgende Pflichtfelder:

```typescript
{
  id: string;           // Eindeutige ID
  type: EntityType;     // "user" | "dive" | "equipment" | etc.
  userId?: string;      // Für users-and-social container
  ownerId?: string;     // Für dive-content container
  // ... weitere Felder
}
```

## API Usage

### Users & Social Queries

```typescript
import { queryUsersSocial, createUsersSocialItem } from '@/lib/cosmos-db';

// User abrufen
const users = await queryUsersSocial<MemberProfile>(
  'SELECT * FROM c WHERE c.type = @type AND c.email = @email',
  [
    { name: '@type', value: 'user' },
    { name: '@email', value: 'user@example.com' }
  ]
);

// Notification erstellen
const notification = await createUsersSocialItem({
  id: 'notif-123',
  type: 'notification',
  userId: 'member-01',
  title: 'New message',
  description: 'You have a new message',
  timestamp: new Date().toISOString()
});
```

### Dive Content Queries

```typescript
import { queryDiveContent, createDiveContentItem } from '@/lib/cosmos-db';

// Alle Dives eines Users
const dives = await queryDiveContent<DiveLogPreview>(
  'SELECT * FROM c WHERE c.type = @type AND c.ownerId = @ownerId',
  [
    { name: '@type', value: 'dive' },
    { name: '@ownerId', value: 'member-01' }
  ]
);

// Equipment hinzufügen
const equipment = await createDiveContentItem({
  id: 'gear-456',
  type: 'equipment',
  ownerId: 'member-01',
  manufacturer: 'Apeks',
  model: 'MTX-R',
  serialNumber: 'ABC-123',
  status: 'bereit',
  lastService: '2025-11-01'
});
```

## Best Practices

1. **Immer mit Type filtern**: `WHERE c.type = "dive"` in Queries
2. **Partition Key nutzen**: Queries sollten userId/ownerId enthalten
3. **Shared Content**: Für gemeinsame Dive Sites: `ownerId: "shared"`
4. **Hierarchische Keys**: Ermöglichen Subpartitionen wie `userId/friends/*`

## Migration

Bei Bedarf Migration von Multi-Container zu 2-Container:

1. Backup erstellen
2. Setup-Skript ausführen
3. Daten mit Type discriminator migrieren
4. API-Layer auf neue Helpers umstellen

## Monitoring

- Azure Portal → Cosmos DB → Metrics
- Request Units (RUs) überwachen
- Query Performance analysieren
- Partition Key Distribution prüfen
