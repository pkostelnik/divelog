# DiveLog API Contract

Base URL: `https://divelog.copilot.ovh/api`

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /dives | Liste aller Tauchgänge |
| POST | /dives | Neuen Tauchgang anlegen |
| PUT | /dives | Tauchgang aktualisieren |
| DELETE | /dives | Tauchgang löschen |
| GET | /equipment | Ausrüstungsliste |
| POST | /equipment | Ausrüstung hinzufügen |
| PUT | /equipment | Ausrüstung aktualisieren |
| DELETE | /equipment | Ausrüstung entfernen |
| GET | /sites | Tauchplätze |
| POST | /sites | Tauchplatz anlegen |
| GET | /media | Medien |
| POST | /media | Medium hinzufügen |
| GET | /notifications | Benachrichtigungen |
| GET | /community | Community-Posts |
| POST | /community | Neuen Post erstellen |

## Datentypen

### DiveLogPreview
```json
{
  "id": "string",
  "type": "dive",
  "ownerId": "string",
  "logNumber": 42,
  "title": "string",
  "location": "string",
  "depth": 32,
  "duration": 48,
  "date": "2025-09-14",
  "buddy": "string",
  "difficulty": "Beginner | Fortgeschritten | Pro",
  "siteId": "string?",
  "diverId": "string?"
}
```

### EquipmentItem
```json
{
  "id": "string",
  "type": "equipment",
  "ownerId": "string",
  "manufacturer": "string",
  "model": "string",
  "serialNumber": "string",
  "status": "bereit | wartung | defekt",
  "lastService": "2025-01-15"
}
```

### DiveSite
```json
{
  "id": "string",
  "type": "site",
  "ownerId": "string",
  "name": "string",
  "country": "string",
  "difficulty": "Beginner | Fortgeschritten | Pro",
  "highlight": "string",
  "coordinates": { "latitude": 0.0, "longitude": 0.0 }
}
```

### MemberProfile
```json
{
  "id": "string",
  "type": "user",
  "userId": "string",
  "name": "string",
  "email": "string",
  "role": "member | admin",
  "joinedAt": "2025-01-01",
  "city": "string",
  "about": "string",
  "certifications": ["string"],
  "favoriteDiveSite": "string",
  "completedDives": 42,
  "preferredLocale": "de | en",
  "avatarUrl": "string?"
}
```

### NotificationItem
```json
{
  "id": "string",
  "type": "notification",
  "userId": "string",
  "title": "string",
  "description": "string",
  "timestamp": "2025-09-14T10:30:00Z"
}
```
