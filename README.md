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

## Development

Built by [@CHeise-MUC](https://github.com/CHeise-MUC) with Claude.
