# Entwicklungsumgebung starten

## Voraussetzungen
- VS Code ist geöffnet
- Du befindest dich im Projektordner `log-your-workout`

---

## Server starten

Du brauchst **zwei Terminals** gleichzeitig in VS Code.  
Neues Terminal öffnen: Menü **Terminal → New Terminal** oder das **+**-Icon im Terminal-Bereich.

> **Tipp:** Wenn du eine Fehlermeldung wie `no such file or directory: apps/web` bekommst,  
> bist du noch nicht im richtigen Ordner. Führe zuerst diesen Befehl aus:
> ```bash
> cd "/Users/christianheise/Development/Mein Coding Erlebnis/log-your-workout"
> ```

### Terminal 1 – Frontend (Next.js)
```bash
cd apps/web
npm run dev
```
→ Läuft auf **http://localhost:3000**

### Terminal 2 – Backend (NestJS)
```bash
cd apps/api
npm run dev
```
→ Läuft auf **http://localhost:3001**

---

## Server stoppen

In jedem Terminal: **Ctrl + C**

---

## Seiten der App

| Seite | URL |
|---|---|
| Login | http://localhost:3000/auth/login |
| Registrierung | http://localhost:3000/auth/register |
| Dashboard | http://localhost:3000/dashboard |
| Übungen | http://localhost:3000/dashboard/exercises |
| Trainingspläne | http://localhost:3000/dashboard/training-plans |
| Training starten | http://localhost:3000/dashboard/workout |
| Trainingshistorie | http://localhost:3000/dashboard/workout/history |
| Zugewiesene Pläne | http://localhost:3000/dashboard/assigned-plans |
| Trainer-Bereich | http://localhost:3000/trainer |

---

## Häufige Probleme

**„Cannot find module" oder Fehler nach Schema-Änderung**
```bash
cd apps/api
npx prisma generate
```

**Datenbankschema geändert → Migration ausführen**
```bash
cd apps/api
npx prisma migrate dev --name beschreibung-der-aenderung
```

**Abhängigkeiten fehlen nach einem `git pull`**
```bash
npm install
```
(im Root-Ordner `log-your-workout` ausführen)
