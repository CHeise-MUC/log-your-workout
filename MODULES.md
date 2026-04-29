# Lernmodule – Log your Workout

Übersicht aller abgeschlossenen und geplanten Module.

---

## ✅ Modul 1 – Projekt-Setup & Monorepo
Turborepo-Monorepo, Next.js Frontend, NestJS Backend, PostgreSQL + Prisma, Supabase Auth.

## ✅ Modul 2 – Authentifizierung
Supabase Auth-Integration, Login/Register-Seiten, JWT-geschützte API-Endpunkte.

## ✅ Modul 3 – Übungen (Exercises)
CRUD für Übungen im Backend, Übungsliste im Frontend.

## ✅ Modul 4 – Trainingspläne
Trainingspläne mit Übungen verknüpfen, Plan-Verwaltung im Frontend.

## ✅ Modul 5 – Workout-Session aufzeichnen
Session starten, Sets loggen (Übung, Wiederholungen, Gewicht), Session abschließen.

## ✅ Modul 6 – Trainer-Rollen & Berechtigungen
Trainer-Rolle in Supabase, RBAC im Backend, Trainer-Bereich im Frontend.

## ✅ Modul 7 – Trainer-Client-Beziehung
Kunden einladen, Einladungsstatus (PENDING/ACTIVE), Kundenliste für Trainer.

## ✅ Modul 8 – Planzuweisung durch Trainer
Trainer weist Kunden Trainingspläne zu, zugewiesene Pläne im Kunden-Dashboard.

## ✅ Modul 9 – Supabase Realtime
Live-Updates bei neuen Sessions und Zuweisungen via Supabase Realtime-Subscriptions.

## ✅ Modul 10 – Mobile App (React Native + Expo)
Erste Expo-App, Auth-Flow, Session loggen auf dem Handy.

## ✅ Modul 11 – CI/CD mit GitHub Actions
Automatische Lint- und Build-Checks bei jedem Push auf main.

## ✅ Modul 12 – Deployment
Frontend auf Vercel, Backend auf Render, Produktionsdatenbank auf Supabase.

## ✅ Modul 13 – Trainingshistorie & Fortschritt
Alle Sessions anzeigen, Fortschrittschart (Recharts), Trainer-Kommentare zu Sessions.

## ✅ Modul 14 – Tailwind CSS & Design System
Tailwind CSS v4, Design Tokens als CSS Custom Properties, App Shell mit kollabierender Sidebar, Trainer-Dashboard, separate Routen /trainer und /trainer/clients.

## 📋 Modul 15 – Professioneller Git-Workflow & Umgebungen

**Ziel:** Vom direkten Push auf `main` zu einem echten Feature-Branch-Workflow — plus saubere Trennung von Integration- und Produktionsumgebung.

### Was wir einführen

**GitHub Flow:**
```
main
 └── feature/[feature-name]   ← ein Branch pro Feature/Story
      └── [Commits]
           └── Pull Request → Agent Code Review → Merge in main
```

### Int vs. Prod – zwei Umgebungen

| | Integration (Int) | Production (Prod) |
|---|---|---|
| **Zweck** | Testen vor dem Release | Was echte Nutzer sehen |
| **Datenbank** | Separate Testdatenbank | Echte Produktionsdatenbank |
| **Deployment** | Automatisch bei jedem PR (Vercel Preview) | Manuell oder nach Merge in main |
| **Fehler** | Dürfen passieren | Müssen verhindert werden |

Int existiert bei uns bereits ansatzweise: jeder Vercel-PR-Preview ist eine Int-Umgebung. Wir formalisieren das und ergänzen eine dedizierte Testdatenbank.

### Workflow Schritt für Schritt

1. **Branch erstellen** für jedes neue Feature (benannt nach JIRA-Story, z.B. `feature/SCRUM-126-public-profile`)
2. **Feature entwickeln** mit Commits auf dem Branch (weiterhin via VS Code)
3. **Pull Request öffnen** auf GitHub → automatisch Vercel Preview-URL (= Int-Umgebung)
4. **Agent Code Review** – Claude analysiert den PR systematisch
5. **Review-Feedback einarbeiten** oder direkt mergen
6. **Merge in main** → automatisches Deployment nach Prod

### Automatisierung & Agents

- **PR-Beschreibung automatisch generieren** – Claude liest den Diff und schreibt Summary + Testplan
- **Agent Code Review** – Claude nutzt die `review`-Skill (Logik, Typsicherheit, Security, Design System)
- **Branch-Schutzregeln auf main** – kein direkter Push mehr möglich (GitHub-Setting)

---

## 📋 Modul 16 – API-Architektur: Swagger, Versionierung & Webhooks

**Ziel:** Alle zukünftigen Endpunkte bekommen von Anfang an eine stabile, dokumentierte und erweiterbare API-Grundlage — bevor neue Features entstehen, die dann nachträglich umgebaut werden müssten.

### Warum jetzt?

Wer jetzt Routen ohne Versionierung baut, hat später ein Problem: Externe Clients (Mobile App, White-Label-Integrations, Stripe) verlassen sich auf bestehende Endpunkte. Ein breaking change bedeutet dann entweder Koordinationsaufwand oder defekte Clients.

### Was wir einführen

**1 – OpenAPI/Swagger (ca. 10 Zeilen Code)**

NestJS hat Swagger-Support eingebaut. Wir installieren `@nestjs/swagger`, konfigurieren es in `main.ts` und ergänzen die wichtigsten Decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`) bei bestehenden Controllern.

Resultat: Interaktive API-Dokumentation unter `/api/docs` — der Kollege und zukünftige Integrationspartner können jeden Endpunkt direkt ausprobieren.

```typescript
// main.ts – ~10 Zeilen
const config = new DocumentBuilder()
  .setTitle('Log Your Workout API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

**2 – API-Versionierung (`/v1/`)**

Alle Routen bekommen das Präfix `/v1/`. Das ermöglicht später `/v2/`-Endpunkte mit breaking changes, ohne bestehende Clients zu brechen.

```typescript
// main.ts
app.setGlobalPrefix('v1');
// Statt: GET /workouts
// Jetzt:  GET /v1/workouts
```

**3 – Webhook-Infrastruktur**

Stripe braucht Webhooks sowieso (Zahlungsbestätigung, Subscription-Events). Wir bauen die Infrastruktur so, dass dieselbe Grundlage später auch für externe Integrationen nutzbar ist (z.B. "Notify me when a new session is logged").

```
POST /v1/webhooks/stripe   ← bereits für Modul 31 (Billing) nötig
POST /v1/webhooks/[custom] ← Erweiterungspunkt für White-Label-Kunden
```

Dazu: Webhook-Secret-Validierung (HMAC-Signatur prüfen) als Security-Standard.

### Was wir dabei lernen
- API-Design-Prinzipien (Versionierung, Konsistenz, Backward Compatibility)
- Swagger/OpenAPI als "lebende Dokumentation" — kein veraltetes Wiki mehr
- Webhooks: Push statt Poll, Event-driven Integration
- Wie echte Backend-Teams APIs für externe Konsumenten designen

### Abgrenzung – was wir bewusst *nicht* bauen

| Idee | Warum nicht jetzt |
|---|---|
| GraphQL | Overhead ohne konkreten Bedarf; REST reicht für unsere Clients |
| gRPC / tRPC | Sinnvoll bei Microservices — wir haben ein Monolith |
| Event-Driven / Message Queues | Premature; erst wenn mehrere Services kommunizieren müssen |
| Microservices | Unser NestJS-Monolith ist bereits modular (WorkoutsModule, UsersModule etc.) — kein Split nötig |

---

## 📋 Modul 17 – End-to-End Tests (Playwright)
Automatisierte Browser-Tests für kritische User Flows: Login, Session starten, Plan zuweisen.

## 📋 Modul 18 – Performance & Monitoring
Web Vitals, Sentry Error Tracking, Alerts bei Prod-Fehlern.

---

## Phase 2 – Kernprodukt: täglicher Nutzwert

## 📋 Modul 19 – Workout UX Enhancements

**Ziel:** Den aktiven Workout deutlich komfortabler machen — kleine Features mit großem täglichem Nutzwert.

- **Rest-Timer** zwischen Sets: konfigurierbarer Countdown nach jedem Set (SCRUM-48)
- **Letzte Werte vorschlagen**: beim Starten einer Übung werden Gewicht/Reps aus der letzten Session vorausgefüllt (SCRUM-50)
- **Persönliche Bestleistungen (PRs)** automatisch erkennen und hervorheben (SCRUM-49)
- **Notiz zur Session**: kurze Freitext-Notiz am Ende einer Session hinterlegen (SCRUM-45)

JIRA: [SCRUM-48](https://logyourworkout.atlassian.net/browse/SCRUM-48) · [SCRUM-50](https://logyourworkout.atlassian.net/browse/SCRUM-50) · [SCRUM-49](https://logyourworkout.atlassian.net/browse/SCRUM-49) · [SCRUM-45](https://logyourworkout.atlassian.net/browse/SCRUM-45)

---

## 📋 Modul 20 – Nutzereinstellungen & Personalisierung

**Ziel:** Die App persönlicher machen und an individuelle Gewohnheiten anpassen.

- **Avatar-Upload**: eigenes Profilbild hochladen statt Initialen (Supabase Storage, gleiche Infrastruktur wie später Tenant-Logos in Modul 30) (SCRUM-138)
- **Einheitenpräferenz**: Metrisch (kg/m) oder Imperial (lbs/ft) wählbar — Datenbank bleibt immer metrisch, nur die Darstellung konvertiert (SCRUM-139)
- Neue Spalte `unitPreference` auf dem User-Modell
- Einstellungs-Seite `/dashboard/settings`

JIRA: [SCRUM-138](https://logyourworkout.atlassian.net/browse/SCRUM-138) · [SCRUM-139](https://logyourworkout.atlassian.net/browse/SCRUM-139)

---

## 📋 Modul 21 – Erweitertes Körper- & Fortschritts-Tracking

**Ziel:** Die App zu einem vollständigen Fitness-Tracker ausbauen — über reine Workout-Logs hinaus.

- **Körpergewicht täglich erfassen** mit Verlaufsdiagramm (SCRUM-53, SCRUM-41)
- **Volumen-Tracking pro Übung** in der Trainingshistorie: Gesamtgewicht pro Session (SCRUM-52)
- **Trainingsstreak & Wochenkalender** auf dem Dashboard (SCRUM-51)
- **Workout-Streak & Meilensteine** mit visuellen Achievements (SCRUM-40)

JIRA: [SCRUM-53](https://logyourworkout.atlassian.net/browse/SCRUM-53) · [SCRUM-41](https://logyourworkout.atlassian.net/browse/SCRUM-41) · [SCRUM-52](https://logyourworkout.atlassian.net/browse/SCRUM-52) · [SCRUM-51](https://logyourworkout.atlassian.net/browse/SCRUM-51) · [SCRUM-40](https://logyourworkout.atlassian.net/browse/SCRUM-40)

---

## 📋 Modul 22 – Schritt-für-Schritt Übungsanleitungen

**Ziel:** Übungen werden von reinen Metadaten (Name, Muskelgruppe) zu echten Anleitungen.

### Was wir bauen

- Jede Übung bekommt eine geordnete Liste von `ExerciseStep`-Einträgen (Text + optionale Bildposition)
- Trainer **und** Nutzer können Steps schreiben und bearbeiten
- Im Workout-Flow werden die Schritte bei jeder Übung einblendbar

### Datenmodell (Ergänzung)
```prisma
model ExerciseStep {
  id         String   @id @default(cuid())
  order      Int
  text       String
  exerciseId String
  exercise   Exercise @relation(fields: [exerciseId], references: [id])
  authorId   String
  author     User     @relation(fields: [authorId], references: [id])
  createdAt  DateTime @default(now())
}
```

### Was wir dabei lernen
- Erweiterung eines bestehenden Datenmodells ohne Breaking Changes
- Berechtigungslogik: wer darf schreiben, wer nur lesen?
- Rich-Content in einer Workout-App

---

## Phase 3 – Trainer-Produkt stärken

## 📋 Modul 23 – Trainer-Features: Erweiterungen

**Ziel:** Das Trainer-Produkt vollständiger machen und echten Mehrwert für zahlende Trainer-Tenants schaffen.

- **Trainer-Hinweise pro Übung** im aktiven Workout des Kunden anzeigen (SCRUM-55)
- **Plan-Zuweisung mit Startdatum & persönlicher Nachricht** an den Kunden (SCRUM-54)
- **Terminbuchung** zwischen Trainer und Kunde direkt in der App (SCRUM-42)

JIRA: [SCRUM-55](https://logyourworkout.atlassian.net/browse/SCRUM-55) · [SCRUM-54](https://logyourworkout.atlassian.net/browse/SCRUM-54) · [SCRUM-42](https://logyourworkout.atlassian.net/browse/SCRUM-42)

---

## 📋 Modul 24 – Benachrichtigungen & E-Mail

**Ziel:** Nutzer über wichtige Ereignisse informieren — Grundlage für alle späteren Engagement-Features.

- **E-Mail bei Trainer-Einladung**: automatische Benachrichtigung wenn ein Trainer den Nutzer einlädt (SCRUM-5)
- Technisch: Supabase Edge Functions + E-Mail-Provider (Resend oder SendGrid)
- Erweiterbar auf: In-App-Benachrichtigungen, Push Notifications (später)

JIRA: [SCRUM-5](https://logyourworkout.atlassian.net/browse/SCRUM-5)

---

## 📋 Modul 25 – Ernährungsplan & Ernährungstagebuch

**Ziel:** Trainer begleiten ihre Kunden ganzheitlich — Training und Ernährung in einer App.

- Trainer erstellt Ernährungspläne (Tage, Mahlzeiten, Kalorien, Makros) und weist sie Kunden zu
- Kunde sieht seinen aktuellen Ernährungsplan im Dashboard
- Optionales **Ernährungstagebuch**: Kunde trägt tägliche Mahlzeiten ein, Trainer sieht die Einträge
- Neues Datenmodell: `NutritionPlan`, `Meal`, `NutritionEntry`
- Baut auf Trainer-Client-Beziehung (Modul 7) und Plan-Zuweisung (Modul 8) auf

**Warum sinnvoll:** Beide Konkurrenten (Trainin, Trainero) haben es prominent — Personal Trainer und Physios arbeiten immer ganzheitlich. Ohne Ernährungskomponente verliert man Kunden an spezialisierte Tools.

JIRA: [SCRUM-142](https://logyourworkout.atlassian.net/browse/SCRUM-142)

---

## 📋 Modul 26 – In-App Chat (Trainer ↔ Klient)

**Ziel:** Direkte Kommunikation zwischen Trainer und Klient in der App — kein WhatsApp, keine E-Mail.

- Echtzeit-Chat auf Basis von Supabase Realtime (bereits aus Modul 9 vorhanden)
- Trainer chattet mit jedem verbundenen Klienten, Klient antwortet
- Ungelesene Nachrichten als Badge in der Navigation
- Chat-Verlauf persistent gespeichert
- Neues Datenmodell: `Message` (senderId, receiverId, text, createdAt, readAt)
- Push-Benachrichtigungen wurden in Modul 24 eingeführt

**Warum sinnvoll:** Direkte Kommunikation ist das stärkste Bindungsmerkmal zwischen Trainer und Klient. Trainero hat es als Kernfeature — ohne Chat laufen Gespräche über externe Kanäle und die App verliert Relevanz im Alltag.

JIRA: [SCRUM-143](https://logyourworkout.atlassian.net/browse/SCRUM-143)

---

## 📋 Modul 27 – Video-Anleitungen für Übungen
Trainer können kurze Videos an Übungen hängen. Baut auf Modul 22 (Schritt-für-Schritt Anleitungen) auf.
Technisch: Supabase Storage, Video-Upload, CDN-Auslieferung.
Zeitpunkt: erst wenn Textanleitungen (Modul 22) etabliert sind.

---

## 🔄 Modul 28 – Claude Design, Figma & Design-to-Code

**Ziel:** Den vollständigen Design-Workflow eines modernen Produktteams durchlaufen — von der Idee über das visuelle Design bis zum fertigen Code.

### Workflow (3 Phasen)

**Phase 1 – Ideation mit Claude Design**
Claude Design liest unser Design-System (CSS Custom Properties, Tailwind) automatisch ein und generiert passende Screen-Entwürfe per Chat. Wir nutzen das als Ideation-Tool für neue Screens (z.B. Übungsdetail-Seite aus Modul 22).
→ Export als HTML oder Screenshot als Referenz-Artefakt

**Phase 2 – Finalisierung in Figma**
Den Claude-Design-Entwurf als Referenz in Figma importieren und dort in saubere Figma-Komponenten überführen (manueller Transfer, da kein direkter Figma-Export existiert). Figma MCP-Integration für den Abgleich mit dem Code.

**Phase 3 – Design-to-Code**
Den finalisierten Figma-Screen mit dem Figma MCP als Vorlage nehmen und in Next.js-Komponenten umsetzen (Tailwind, Design-System-Variablen).

### Was wir dabei lernen
- Claude Design als Rapid-Prototyping-Tool (Research Preview, seit April 2026)
- Wie Designer und Entwickler in der Praxis zusammenarbeiten
- Figma als "Single Source of Truth" für UI-Entscheidungen
- Design-to-Code mit KI-Unterstützung (Figma MCP)

## Phase 4 – Go-to-Market & Business

## 📋 Modul 29 – Landing Page

**Ziel:** Den ersten Eindruck der App professionell gestalten — statt direkt auf den Login-Screen zu landen, sieht ein neuer Besucher eine überzeugende Startseite.

### Aufbau (inspiriert von Freeletics.com)

- **Navigation**: Logo links, "Kostenlos starten"-CTA rechts
- **Hero**: Großes App-Screenshot/Mockup + klare Headline ("Dein Training. Dein Fortschritt.") + primärer CTA
- **Social Proof**: Platzhalter-Zahlen (Sessions geloggt, aktive Nutzer) — später durch echte Werte ersetzt
- **Feature-Sektion**: 3 Kacheln — Workouts loggen · Fortschritt verfolgen · Trainer verbinden
- **Trainer-Sektion**: Teaser für das White-Label-Angebot ("Du bist Trainer oder Physio?")
- **Footer**: Links, Impressum

### Was wir dabei lernen
- Next.js Middleware für Auth-Redirect (eingeloggte Nutzer → `/dashboard`)
- Landing Page als eigenständige Marketing-Seite in einer App-Codebasis
- Conversion-fokussiertes Copywriting & Layout

JIRA: [SCRUM-141](https://logyourworkout.atlassian.net/browse/SCRUM-141)

---

## 📋 Modul 30 – Multi-Tenant-Architektur & Feature Flags

**Ziel:** Die App wird zu einem Produkt das an mehrere Organisationen (Praxen, Studios, Trainer) verkauft werden kann — mit konfigurierbaren Modulen und Preisstufen.

### Teil 1 – Tenant-Grundlage (wird bereits in Modul 14 vorbereitet ✅)

Ein `Tenant` repräsentiert eine Organisation (z.B. "Physio Müller GmbH" oder "Freelance-Trainer Max").
Das `tenantId`-Feld wurde bereits als optionales Feld auf dem `User`-Modell angelegt, damit spätere Migrationen keine Breaking Changes erfordern.

### Teil 2 – Feature Flags

Feature Flags sind Schalter, die zur Laufzeit bestimmen ob ein Feature sichtbar ist — unabhängig davon ob der Code bereits deployed ist. Das erlaubt:
- **Schrittweises Ausrollen**: Feature erst für 10% der Nutzer aktivieren
- **Beta-Nutzer**: ausgewählten Kunden Zugang geben bevor alle es sehen
- **Modulares Produkt**: jeder Tenant bekommt nur die Features die er gebucht hat

```
Tenant
 ├── feature_flags: { community: false, video_instructions: true, ... }
 └── Users → sehen nur was ihr Tenant freigeschaltet hat
```

### Teil 3 – Modulares Produkt mit Preisstufen

| Modul | Enthält | Immer dabei? |
|---|---|---|
| **Core** | Übungen, Trainingspläne, Session aufzeichnen | ✅ Ja |
| **Trainer** | Trainer-Client-Beziehung, Planzuweisung, Fortschritt | Optional |
| **Anleitungen** | Schritt-für-Schritt + Video | Optional |
| **Community** | Feed, Follow, Kudos | Optional |
| **Analytics** | Erweiterte Auswertungen, Exports | Optional |

### Teil 4 – White-Label / Tenant Branding

Jeder Tenant kann die App unter seinem eigenen Look betreiben — mit eigenem Logo, eigenen Farben und einer eigenen Subdomain (z.B. `physio-mueller.logworkout.app`). Das ist das klassische White-Label-Modell wie es große B2B-SaaS-Produkte einsetzen.

**Was dafür gebaut wird:**
- `TenantBranding`-Tabelle: `primaryColor`, `logoUrl`, `subdomain`
- Supabase Storage für Logo-Uploads (gleiche Infrastruktur wie Avatar-Upload aus Modul 21)
- CSS Custom Properties zur Laufzeit überschreiben (Design-System-Variablen pro Tenant)
- Subdomain-Routing in Next.js (`physio-mueller.logworkout.app` → Tenant lookup)
- Tenant-Onboarding-Flow: Registrierung, Logo hochladen, Farben einstellen

**Basis bereits gelegt:** `tenantId` ist seit Modul 14 als optionales Feld auf dem `User`-Modell vorhanden ✅

### Architektur-Änderungen

- Neue Tabellen: `Tenant`, `TenantFeatureFlag`, `TenantBranding`
- Row Level Security in Supabase: jeder Query filtert automatisch nach `tenantId`
- Admin-Oberfläche: Feature-Flags und Branding pro Tenant setzen
- Billing-Integration (z.B. Stripe) kommt in Modul 31

### Was wir dabei lernen
- Multi-Tenant-Architektur (Standard in B2B SaaS)
- White-Label-Produkte: wie überschreibt man ein Design-System zur Laufzeit?
- Feature Flags in der Praxis
- Produktstrategie: wie baut man ein skalierbares Preismodell?

---

## 📋 Modul 31 – Stripe Billing & Subscription-Management
Tenants buchen Preisstufen (Core, Trainer, Anleitungen, Community, Analytics). Stripe Checkout, Webhooks, Subscription-Status in der Datenbank.

---

## 📋 Modul 32 – Admin-Dashboard für Tenant-Verwaltung
Internes Dashboard für Plattform-Admins: Tenant-Übersicht, Feature Flags setzen, Branding-Vorschau, Nutzerliste pro Tenant.
JIRA: [SCRUM-137](https://logyourworkout.atlassian.net/browse/SCRUM-137)

---

## 📋 Modul 33 – Medienbibliothek

**Ziel:** Trainer verwalten eigene Inhalte (PDFs, Bilder, Videos) und teilen sie gezielt mit Kunden.

- Upload via Supabase Storage (gleiche Infrastruktur wie Avatare und Tenant-Logos)
- Inhalte können einzelnen Kunden oder Gruppen zugewiesen werden
- Kunde sieht zugewiesene Inhalte in einem eigenen Bereich
- Baut auf Modul 27 (Video-Anleitungen) auf

JIRA: [SCRUM-144](https://logyourworkout.atlassian.net/browse/SCRUM-144)

---

## Phase 5 – Erweitert & Speziell (erst wenn Nutzer vorhanden)

## 📋 Modul 34 – PWA & Offline-Modus

**Ziel:** Die App ohne native App vollwertig auf dem Handy nutzbar machen — auch ohne Internetverbindung.

- Service Worker für Offline-Caching
- IndexedDB: Sets während eines Workouts offline speichern
- Sync-Mechanismus: Daten werden beim nächsten Online-Moment an die API übertragen
- "Zur Startseite hinzufügen" (Add to Home Screen) auf iOS und Android

JIRA: [SCRUM-57](https://logyourworkout.atlassian.net/browse/SCRUM-57)

---

## 📋 Modul 35 – KI-Features

**Ziel:** Intelligente Empfehlungen und automatisierte Prozesse — sinnvoll erst wenn Kerndaten vorhanden sind.

- **Trainingsplan-Empfehlung** basierend auf trainierten Muskelgruppen und Fortschritt (SCRUM-39)
- **KI-Feedback-Agent**: Claude analysiert Workout-Sessions und gibt strukturiertes Feedback, kritische Fälle werden als JIRA-Task eskaliert (SCRUM-105)

JIRA: [SCRUM-39](https://logyourworkout.atlassian.net/browse/SCRUM-39) · [SCRUM-105](https://logyourworkout.atlassian.net/browse/SCRUM-105)

---

## 📋 Modul 36 – 🏪 Community & Marketplace
Activity Feed, Follow-System, Kudos-Reactions, Achievements. Erst umsetzen wenn genug echte Nutzer vorhanden sind. (SCRUM-125)
