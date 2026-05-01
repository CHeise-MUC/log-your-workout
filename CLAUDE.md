# CLAUDE.md – Log your Workout

Dieses Dokument wird von Claude Code beim Start automatisch eingelesen.
Es beschreibt Architektur, Konventionen und wichtige Entscheidungen für dieses Projekt.

---

## Projekt-Überblick

Fullstack Workout-Tracking-App. Nutzer loggen Trainingseinheiten (Übungen, Sets, Gewichte).
Trainer können Kunden Pläne zuweisen und Fortschritt verfolgen.
Langfristiges Ziel: Multi-Tenant SaaS mit White-Label-Fähigkeit.

---

## Tech Stack

| Schicht | Technologie |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| Backend | NestJS, TypeScript, Prisma ORM |
| Datenbank | PostgreSQL via Supabase |
| Auth | Supabase Auth (JWT) |
| Realtime | Supabase Realtime |
| Storage | Supabase Storage |
| Mobile | React Native + Expo (geplant) |
| Monorepo | Turborepo |
| CI/CD | GitHub Actions |

---

## Monorepo-Struktur

```
log-your-workout/
├── apps/
│   ├── web/          # Next.js Frontend → localhost:3000
│   └── api/          # NestJS Backend  → localhost:3001
├── packages/         # Geteilter Code (in Vorbereitung)
└── .github/
    └── workflows/    # CI/CD Pipelines
```

### Frontend (apps/web)
- Pages Router → `app/` Verzeichnis (Next.js App Router)
- Design System: CSS Custom Properties als Tailwind v4 Design Tokens
- Auth-State über Supabase Client, geschützte Routen via Middleware
- Wichtige Routen: `/dashboard`, `/dashboard/workout`, `/trainer`, `/trainer/clients`

### Backend (apps/api)
- NestJS mit strikter Modularisierung: ein Modul pro Domäne
- Bestehende Module: `WorkoutSessionsModule`, `UsersModule`, `ExercisesModule`, `TrainingPlansModule`, `AssignedPlansModule`, `ProgressModule`
- Jeder Controller ist JWT-geschützt (`@UseGuards(SupabaseAuthGuard)`)
- API-Prefix: `/v1/` (alle Routes versioniert)
- Swagger-Docs: `http://localhost:3001/api/docs`

### Datenbank
- Schema in `apps/api/prisma/schema.prisma`
- Nach Schema-Änderung immer: `npx prisma migrate dev --name <beschreibung>`
- Danach: `npx prisma generate`
- `tenantId` ist als optionales Feld auf `User` vorbereitet (Multi-Tenant-Grundlage)
- **RLS:** Ein Event Trigger (`auto_enable_rls_trigger`) aktiviert Row Level Security automatisch auf jeder neuen Tabelle — kein manueller Schritt nötig. Prisma/Backend nutzt `service_role` und ist davon nicht betroffen.

---

## Wichtige Konventionen

**TypeScript:** Strict Mode. Kein `any`. Typen immer explizit bei Funktionsparametern.

**Dateinamen:** kebab-case für Dateien (`workout-session.service.ts`), PascalCase für Klassen/Komponenten.

**Komponenten:** Server Components by default in Next.js. `'use client'` nur wenn nötig (Interaktivität, Hooks).

**API-Responses:** Immer typisierte DTOs. Keine rohen Prisma-Objekte direkt aus dem Controller zurückgeben.

**Fehlerbehandlung:** NestJS `HttpException` im Backend. Im Frontend immer try/catch mit User-Feedback.

**CSS:** Tailwind Utility Classes + CSS Custom Properties für Design Tokens. Keine Inline-Styles. Keine neuen CSS-Dateien anlegen.

---

## Referenz-Dokumente

| Dokument | Inhalt |
|---|---|
| `MODULES.md` | Komplette Modulplanung (16–36 geplante Module) |
| `JIRA_RULES.md` | JIRA-Standards: Epics, Stories, Akzeptanzkriterien, DOs/DON'Ts |
| `TESTING.md` | Testing-Standards und Regeln |
| `../PROJECT_RULES.md` | Übergeordnete Projektregeln (Fundament, Git, Scope, ADRs) |

---

## Was Claude in diesem Projekt NICHT tut

- Kein `git commit` oder `git push` — Christian commitet selbst via VS Code
- Kein `npm install` ohne explizite Zustimmung — fehlende Pakete werden gemeldet
- Keine neuen JIRA Epics ohne vorherige Suche nach bestehenden Epics
- JIRA nur für echte Produkt-Features, Bugs, technische Tasks — keine Lernschritte
