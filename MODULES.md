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

## 🔄 Modul 15 – Figma & Design-to-Code
Figma für UI-Design: bestehende Screens in Figma nachbauen (Code-to-Design), neue Screens in Figma entwerfen und implementieren (Design-to-Code). Figma MCP-Integration.

## 📋 Modul 16 – Professioneller Git-Workflow mit Agent-gestütztem Code Review

**Ziel:** Vom direkten Push auf `main` zu einem echten Feature-Branch-Workflow mit automatisiertem Review.

### Was wir einführen

**GitHub Flow:**
```
main
 └── feature/[feature-name]   ← ein Branch pro Feature/Story
      └── [Commits]
           └── Pull Request → Agent Code Review → Merge in main
```

### Workflow Schritt für Schritt

1. **Branch erstellen** für jedes neue Feature (benannt nach JIRA-Story, z.B. `feature/SCRUM-126-public-profile`)
2. **Feature entwickeln** mit Commits auf dem Branch (weiterhin via VS Code)
3. **Pull Request öffnen** auf GitHub
4. **Agent Code Review** – Claude analysiert den PR automatisch (Logik, Sicherheit, Codequalität, Konsistenz mit dem Rest der Codebase)
5. **Review-Feedback einarbeiten** oder direkt mergen
6. **Merge in main** via GitHub

### Automatisierung & Agents

- **PR-Beschreibung automatisch generieren** – Claude liest den Diff und schreibt Summary + Testplan
- **Agent Code Review** – Claude nutzt die `review`-Skill um den PR systematisch zu prüfen:
  - Logikfehler und Edge Cases
  - TypeScript-Typsicherheit
  - Konsistenz mit bestehendem Code (Naming, Patterns)
  - Design System Konformität (CSS Variables, Tailwind-Klassen)
  - Security (keine exponierten Secrets, Input Validation)
- **Branch-Schutzregeln auf main** – kein direkter Push mehr möglich (optional, als GitHub-Setting)

### Was wir dabei lernen

- Feature-Branch-Workflow (Standard in allen professionellen Teams)
- Pull Requests schreiben und reviewen
- Wie echtes Code Review in der Praxis aussieht
- Wie Agents in den Entwicklungs-Workflow integriert werden können

---

## 💡 Geplante spätere Module (Ideen)

- **Modul 17** – End-to-End Tests (Playwright)
- **Modul 18** – Performance & Monitoring (Web Vitals, Sentry)
- **Modul 19** – 🏪 Community & Marketplace (SCRUM-125) — erst wenn genug Nutzer vorhanden
