# Log your Workout 🏋️

A fullstack workout tracking application. Log exercises, sets, reps, and weights. Built to learn professional software development.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 + React 19 + TypeScript |
| Backend | NestJS + TypeScript |
| Database | PostgreSQL + Prisma |
| Auth | Supabase Auth |
| Mobile | React Native + Expo (coming later) |
| Monorepo | Turborepo |
| CI/CD | GitHub Actions |

## Project Structure

```
log-your-workout/
├── apps/
│   ├── web/        # Next.js frontend (the website)
│   └── api/        # NestJS backend (the server)
├── packages/       # Shared code (coming later)
└── .github/
    └── workflows/  # CI/CD pipelines
```

## Getting Started

```bash
# Install dependencies
npm install

# Start all apps in development mode
npm run dev
```

The web app will run on http://localhost:3000
The API will run on http://localhost:3001

## Local Development

Du brauchst **zwei Terminals** gleichzeitig in VS Code (Terminal → New Terminal oder das **+**-Icon).

```bash
# Terminal 1 – Frontend (Next.js)
cd apps/web && npm run dev
# → http://localhost:3000

# Terminal 2 – Backend (NestJS)
cd apps/api && npm run dev
# → http://localhost:3001
```

### App-Seiten

| Seite | URL |
|---|---|
| Login | http://localhost:3000/auth/login |
| Dashboard | http://localhost:3000/dashboard |
| Übungen | http://localhost:3000/dashboard/exercises |
| Trainingspläne | http://localhost:3000/dashboard/training-plans |
| Training starten | http://localhost:3000/dashboard/workout |
| Trainingshistorie | http://localhost:3000/dashboard/workout/history |
| Trainer-Bereich | http://localhost:3000/trainer |

### Häufige Probleme

```bash
# Schema-Fehler nach Änderungen
cd apps/api && npx prisma generate

# Migration nach Datenbankänderung
cd apps/api && npx prisma migrate dev --name beschreibung

# Abhängigkeiten fehlen nach git pull
npm install   # im Root-Ordner ausführen
```

---

Built by [@CHeise-MUC](https://github.com/CHeise-MUC) with Claude.
