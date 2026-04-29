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

**Größenregel:** Ein Epic sollte in einem Quartal abschließbar sein. Wenn ein Epic voraussichtlich länger als 3 Monate läuft, ist es kein Epic — es ist ein Produkt-Bereich und muss weiter aufgeteilt werden.

**Vor dem Anlegen immer prüfen:** Erst alle bestehenden Epics abrufen (`issuetype = Epic AND project = SCRUM`), dann entscheiden. Duplikate können per API nicht gelöscht werden.

**Bestehende Epics (nicht duplizieren):**
- SCRUM-34 – `🏋️ Workout & Training` — Sessions, Sets, Übungen, UX im aktiven Workout
- SCRUM-35 – `🎓 Trainer & Kunden` — Trainer-Rolle, Einladungen, Planzuweisung, Chat
- SCRUM-36 – `📊 Analytics & Fortschritt` — Fortschrittscharts, Körpergewicht, Streaks
- SCRUM-37 – `🏪 Community & Marketplace` — Feed, Follow, Kudos, Achievements
- SCRUM-38 – `⚙️ Infrastruktur & Skalierbarkeit` — CI/CD, API, Multi-Tenant, Billing, DevOps

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

### Epic Anti-Patterns — was ein Epic NICHT ist

| Anti-Pattern | Problem | Besser |
|---|---|---|
| `Miscellaneous` / `Sonstiges` | Wird zum Junk-Drawer, Issues verschwinden darin | Passendes bestehendes Epic finden oder klares Thema definieren |
| Epic = gesamtes Projekt | Läuft ewig, kein Fortschritt sichtbar | In mehrere thematische Epics aufteilen |
| Epic für ein einzelnes Feature | Zu granular; eine Story reicht | Story direkt unter passendem Epic anlegen |
| Epic ohne Beschreibung | Unklar was dazugehört und was nicht | Immer 2–3 Sätze Kontext schreiben |

---

## Stories & Tasks

### Story-Größe — die wichtigste Regel

Eine Story muss in **einem Sprint fertig werden** (bei euch: 1–3 Entwicklungstage). Wenn das nicht realistisch ist, muss die Story gesplittet werden.

**Wann splitten?**
- Beim Schätzen entsteht Uneinigkeit ("das könnten 2 Tage oder 2 Wochen sein") → zu vage, zu groß
- Die Akzeptanzkriterien-Liste hat 7+ Einträge → wahrscheinlich zwei Stories
- Die Story tut zwei grundlegend verschiedene Dinge (`und` im Titel ist ein Warnsignal)
- Die Story spannt Frontend, Backend und Datenbankänderung in komplexer Weise auf → prüfen ob vertikale Slices möglich sind

**Splitting-Techniken (praxisnah):**

| Technik | Wann | Beispiel |
|---|---|---|
| **Nach Nutzer-Rolle** | Unterschiedliche Rollen brauchen unterschiedliche UX | Story für Trainer + separate Story für Klient |
| **Nach CRUD** | Create/Read/Update/Delete als eigene Stories | Erst "Ernährungsplan anzeigen", dann "Ernährungsplan erstellen" |
| **Nach Happy Path / Edge Case** | Erst den Normalfall, dann Fehlerfälle | Erst "Login funktioniert", dann "Fehlerbehandlung bei falschem Passwort" |
| **Nach Daten-Typ** | Feature für mehrere Eingabetypen | Erst "Upload für Bilder", dann "Upload für PDFs" |
| **Nach Workflow-Schritt** | Langer Prozess in Schritte zerlegen | Erst "Ernährungsplan erstellen", dann "Ernährungsplan zuweisen" |

### Titel
- Kurz und konkret (max. 70 Zeichen)
- Beschreibt das Feature, nicht die Implementierung
- Kein Jargon
- Kein `und` im Titel (Warnsignal für zu große Story)

**Gut:** `E-Mail-Benachrichtigung bei Trainer-Einladung versenden`
**Schlecht:** `E-Mail-System bauen und Benachrichtigungen konfigurieren und Templates anlegen`

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
- Inhalt des Subtasks: eine konkrete, testbare Bedingung — pass oder fail, kein Ermessensspielraum
- Formulierung: „Wenn … dann …" oder **Given / When / Then** (bevorzugt bei komplexerem Verhalten)

**Einfaches Format (`Wenn … dann …`):**
- `AC1 – Einladungsmail wird automatisch verschickt, wenn Kunde kein Konto hat`
- `AC2 – Mail enthält Trainernamen, Erklärungstext und Registrierungslink`
- `AC3 – Kein Mailversand, wenn Kunde bereits ein Konto hat`
- `AC4 – Fehler beim Mailversand werden serverseitig geloggt`

**Erweitertes Format (`Given / When / Then`) für komplexes Verhalten:**
```
Given: Ich bin in einer aktiven Workout-Session
When:  Ich einen Set abschließe
Then:  Startet automatisch ein 90-Sekunden-Timer, den ich pausieren oder überspringen kann
```

**Was ein Akzeptanzkriterium NICHT ist:**
- ❌ `Sieht gut aus` — nicht testbar
- ❌ `Ist performant` — nicht messbar ohne Zahl
- ❌ `Funktioniert korrekt` — zu vage
- ✅ `Lädt in unter 2 Sekunden bei 100 gleichzeitigen Sessions` — konkret und testbar

> **Merke:** Akzeptanzkriterien werden **vor** dem Sprint Planning geschrieben — nicht während der Entwicklung. Wer Akzeptanzkriterien schreibt während er schon kodiert, beschreibt was er gebaut hat, nicht was gebraucht wird.

> Die Akzeptanzkriterien gehören **nicht** in die Description der Story – sondern ausschließlich als Subtasks.

---

## DOs & DON'Ts

### ✅ DOs

| Regel | Warum |
|---|---|
| Story immer aus Nutzerperspektive schreiben (`Als [Rolle]…`) | Fokus auf Wert, nicht auf Implementierung |
| `damit [Nutzen]` immer ausfüllen | Ohne den Nutzen fehlt die Begründung warum etwas gebaut wird |
| Akzeptanzkriterien vor Sprint Planning schreiben | Wer sie während der Entwicklung schreibt, beschreibt was er gebaut hat |
| Entscheidungen in die Issue-Description schreiben | Kommentarverläufe werden nicht gelesen; nach 3 Monaten weiß niemand mehr warum |
| Story schließen wenn alle ACs als Subtasks erledigt sind | Fortschritt bleibt sichtbar |
| Bei Unklarheit lieber nachfragen als raten | Ein falsches Ticket kostet mehr als eine kurze Klärung |

### ❌ DON'Ts

| Anti-Pattern | Problem |
|---|---|
| `Als System möchte ich…` | Systeme haben keine Ziele. Immer eine echte Nutzer-Rolle einsetzen |
| Story-Titel mit `und` (`… bauen und … konfigurieren`) | Warnsignal: wahrscheinlich zwei Stories in einer |
| Story die mehrere Sprints dauert | Ist eine Story zu groß → splitten (siehe Splitting-Techniken oben) |
| Akzeptanzkriterien in die Description schreiben | Gehören als Subtasks, damit Fortschritt sichtbar ist |
| Epic für ein einzelnes Feature anlegen | Eine Story unter bestehendem Epic reicht |
| `Miscellaneous`-Epic oder `Sonstiges`-Sammelbecken | Wird zum Junk-Drawer; Issues verschwinden darin |
| Vage Akzeptanzkriterien (`soll schnell sein`, `sieht gut aus`) | Nicht testbar, führt zu Diskussionen beim Review |
| Entscheidungen nur in Kommentaren diskutieren | Nach 3 Monaten findet das niemand mehr; in Description schreiben |
| JIRA für Lernschritte oder Modul-Fortschritte nutzen | JIRA ist für echte Produkt-Features, Bugs und technische Tasks |
| Neues Epic anlegen ohne bestehende Epics zu prüfen | Erzeugt Duplikate die per API nicht löschbar sind |

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
