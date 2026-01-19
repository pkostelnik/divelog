# DiveLog Studio Logos

Diese Ordner enthält verschiedene Logo-Varianten für die DiveLog Studio App.

## Verfügbare Varianten

### 1. **logo.svg** (512x512px)
Hochauflösendes Logo für große Anwendungen:
- Marketing-Materialien
- Social Media Posts
- Präsentationen
- Druckmedien

**Features:**
- Detaillierte Taucher-Silhouette
- Tauchflasche und Flossen
- Animierte Luftblasen mit Glow-Effekt
- Welleneffekt im Hintergrund
- Ozean-Gradient (Türkis zu Dunkelblau)

### 2. **logo-icon.svg** (128x128px)
Vereinfachtes Icon für mittlere Größen:
- App-Icons
- Toolbar-Buttons
- Benachrichtigungen
- Kleine UI-Elemente

**Features:**
- Vereinfachte Taucher-Silhouette
- Klare Konturen für bessere Lesbarkeit
- Abgerundete Ecken (border-radius: 28px)
- 6 Luftblasen verschiedener Größen

### 3. **logo-horizontal.svg** (240x48px)
Horizontale Variante mit Text:
- Website-Header
- E-Mail-Signaturen
- Dokument-Header
- Navigation

**Features:**
- Kompaktes Icon links
- "DiveLog" in fetter Schrift (#0F172A)
- "Studio" in leichter Schrift (#64748B)
- Optimiert für kleine Höhen

## Favicon-Integration

Die App verwendet dynamisch generierte Favicons über Next.js:

- **app/icon.tsx** - Generiert favicon.ico (32x32px)
- **app/apple-icon.tsx** - Generiert Apple Touch Icon (180x180px)

## Verwendung in der App

### React-Komponente
```tsx
import { AppLogo } from '@/components/ui/app-logo';

// Icon-Variante (Standard)
<AppLogo />

// Mit Größe
<AppLogo size="sm" />  // 24x24
<AppLogo size="md" />  // 32x32 (Standard)
<AppLogo size="lg" />  // 48x48

// Vollständige Variante (derzeit nicht implementiert)
<AppLogo variant="full" />
```

### Direkte SVG-Verwendung
```tsx
<img src="/assets/logo.svg" alt="DiveLog Studio" width="512" height="512" />
<img src="/assets/logo-icon.svg" alt="DiveLog Studio" width="128" height="128" />
<img src="/assets/logo-horizontal.svg" alt="DiveLog Studio" width="240" height="48" />
```

## Design-Entscheidungen

### Farbschema
- **Primär-Gradient**: #0EA5E9 (sky-500) → #0369A1 (sky-700)
- **Akzente**: #38BDF8 (sky-400) für Luftblasen
- **Weiß**: Taucher-Silhouette mit 95% Opacity

### Symbolik
- **Taucher**: Repräsentiert Tauchsport und Abenteuer
- **Luftblasen**: Dynamik und Unterwasser-Atmosphäre
- **Ozean-Gradient**: Tiefe und professioneller Look
- **Runde Form**: Freundlich und modern

### Barrierefreiheit
- Hoher Kontrast zwischen Vordergrund und Hintergrund
- Klare Silhouetten für gute Erkennbarkeit
- Funktioniert in verschiedenen Größen
- aria-label für Screen-Reader

## Technische Details

- **Format**: SVG (Scalable Vector Graphics)
- **Farbprofil**: RGB
- **Transparenz**: Ja (alpha channel)
- **Optimierung**: Hand-optimiert für beste Dateigröße

## Zukünftige Varianten (TODO)

- [ ] Dark Mode Variante
- [ ] Monochrome Variante
- [ ] Animation für Luftblasen
- [ ] Social Media Varianten (OpenGraph, Twitter Card)
- [ ] PWA Icons (verschiedene Größen)
