# JIRA Story-Regeln – Log my Workout

Dieses Dokument definiert den Standard für das Erstellen von Stories im JIRA-Projekt **Log my Workout** (Projekt-Key: `SCRUM`).
Alle Stories werden nach diesem Schema erstellt – von Claude oder manuell.

---

## Story-Typ

Neue Features und Funktionalitäten werden immer als **Story** angelegt.
Technische Aufgaben ohne direkten Nutzernutzen → **Task**
Fehler → **Bug**

---

## Titel

- Kurz und konkret (max. 70 Zeichen)
- Beschreibt das Feature, nicht die Implementierung
- Kein Jargon

**Beispiel:** `E-Mail-Benachrichtigung bei Trainer-Einladung versenden`

---

## Beschreibungsstruktur

Das JIRA-Projekt „Log my Workout" ist ein **Next-gen Projekt** – es gibt kein natives Acceptance-Criteria-Feld.
Deshalb gilt folgende Aufteilung:

| Bereich | Wo in JIRA |
|---|---|
| User Story + Hintergrund + Technische Hinweise | **Description** der Story |
| Akzeptanzkriterien | **Subtasks** der Story (je ein Subtask pro Kriterium) |

---

### Description – Inhalt (Pflicht: 1 + 3; optional: 2 + 4)

#### 1. User Story (Pflicht)
```
Als [Rolle] möchte ich [Aktion] – damit [Nutzen].
```
Beispiel:
> Als Trainer möchte ich, dass mein eingeladener Kunde automatisch eine E-Mail erhält – damit er weiß, dass er sich registrieren soll.

#### 2. Hintergrund (optional)
Kurze Erklärung warum dieses Feature gebraucht wird.
Beschreibt den aktuellen Zustand (Was fehlt? Was ist das Problem?).

#### 3. Technische Hinweise (optional)
- Relevante Dateipfade, Dienste oder Bibliotheken
- Umgebungsvariablen die hinzugefügt werden müssen
- Keine vollständigen Code-Blöcke – nur Hinweise

---

### Akzeptanzkriterien – als Subtasks (Pflicht)

Jedes Akzeptanzkriterium wird als eigener **Subtask** unter der Story angelegt.

- Mindestens 2, maximal 6 Subtasks pro Story
- Titel-Format: `AC[Nr] – [Kurzbeschreibung]`
- Inhalt des Subtasks: eine konkrete, testbare Bedingung
- Formulierung: „Wenn … dann …" oder direkte Aussage

**Beispiel (Subtask-Titel):**
- `AC1 – Einladungsmail wird automatisch verschickt, wenn Kunde kein Konto hat`
- `AC2 – Mail enthält Trainernamen, Erklärungstext und Registrierungslink`
- `AC3 – Kein Mailversand, wenn Kunde bereits ein Konto hat`
- `AC4 – Fehler beim Mailversand werden serverseitig geloggt`

> **Merke:** Die Akzeptanzkriterien gehören **nicht** in die Description der Story – sondern ausschließlich als Subtasks.

---

## Labels

Jede Story bekommt 1–3 Labels zur Kategorisierung:

| Bereich | Label |
|---|---|
| Authentifizierung | `auth` |
| Trainer-Features | `trainer` |
| Kunden-Features | `client` |
| E-Mail / Benachrichtigungen | `notifications`, `email` |
| Datenbank / Schema | `database` |
| API / Backend | `backend` |
| Frontend | `frontend` |
| Mobile App | `mobile` |

---

## Priorität

| Priorität | Wann |
|---|---|
| **Highest** | Blocker – App funktioniert nicht ohne dieses Feature |
| **High** | Wichtige Funktion für Core-Workflow |
| **Medium** | Sinnvolle Ergänzung, kein Blocker |
| **Low** | Nice-to-have, kann warten |

---

## JIRA-Projekt

- **Projekt:** Log my Workout
- **Key:** `SCRUM`
- **URL:** https://logyourworkout.atlassian.net
