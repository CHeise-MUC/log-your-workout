# JIRA-Regeln – Log my Workout

Dieses Dokument definiert den verbindlichen Standard für alle Issue-Typen im JIRA-Projekt **Log my Workout** (Projekt-Key: `SCRUM`).
Gilt für Claude und manuelle Erstellung gleichermaßen.

---

## Issue-Hierarchie

```
Epic
└── Story / Task / Bug
    └── Subtask (= Akzeptanzkriterium)
```

| Typ | Wann |
|---|---|
| **Epic** | Thematisches Cluster, das mehrere Stories/Tasks umfasst |
| **Story** | Neues Feature oder Funktionalität mit direktem Nutzernutzen |
| **Task** | Technische Aufgabe ohne direkten Nutzernutzen (Infrastruktur, Refactoring) |
| **Bug** | Fehler in bestehender Funktionalität |
| **Subtask** | Einzelnes Akzeptanzkriterium einer Story oder Task |

---

## Epics

### Wann ein Epic anlegen?
Ein Epic wird angelegt, wenn mehrere Stories oder Tasks thematisch zusammengehören und gemeinsam eine größere Produktdimension abbilden.

### Benennung
Format: `[Emoji] [Thema]`

Beispiele aus diesem Projekt:
- `🏋️ Workout & Training`
- `🎓 Trainer & Kunden`
- `📊 Analytics & Fortschritt`
- `🏪 Community & Marketplace`
- `⚙️ Infrastruktur & Skalierbarkeit`

### Beschreibung
Ein Epic braucht eine kurze Beschreibung (2–3 Sätze), die erklärt was dieses Thema umfasst und warum es wichtig ist.

### Zuweisung
Jede Story und jeder Task wird einem Epic zugewiesen (Feld `parent` in der JIRA API). Issues ohne Epic-Zuweisung sind die Ausnahme, nicht die Regel.

---

## Stories & Tasks

### Titel
- Kurz und konkret (max. 70 Zeichen)
- Beschreibt das Feature, nicht die Implementierung
- Kein Jargon

**Beispiel:** `E-Mail-Benachrichtigung bei Trainer-Einladung versenden`

### Beschreibungsstruktur

Das JIRA-Projekt „Log my Workout" ist ein **Next-gen Projekt** – es gibt kein natives Acceptance-Criteria-Feld.
Deshalb gilt folgende Aufteilung:

| Bereich | Wo in JIRA |
|---|---|
| User Story + Hintergrund + Technische Hinweise | **Description** der Story |
| Akzeptanzkriterien | **Subtasks** der Story (je ein Subtask pro Kriterium) |

#### 1. User Story (Pflicht bei Stories)
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

## Akzeptanzkriterien – als Subtasks (Pflicht)

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

Jede Story und jeder Task bekommt 1–3 Labels zur Kategorisierung:

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
