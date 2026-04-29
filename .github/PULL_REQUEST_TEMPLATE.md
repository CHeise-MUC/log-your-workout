## Was wurde gebaut?

<!-- Kontext: Warum existiert diese Änderung? Welches Problem löst sie? -->
<!-- Lösung: Was wurde konkret geändert? 2–3 Sätze reichen. -->

JIRA: [SCRUM-XXX](https://logyourworkout.atlassian.net/browse/SCRUM-XXX)

---

## Art der Änderung

- [ ] Neues Feature
- [ ] Bug Fix
- [ ] Refactoring (kein funktionaler Unterschied)
- [ ] Dokumentation
- [ ] Infrastruktur / DevOps

---

## Breaking Changes

- [ ] **Nein** – bestehende Clients und Datenstrukturen sind nicht betroffen
- [ ] **Ja** – folgende Änderungen sind nicht abwärtskompatibel:

<!-- Falls Ja: Welche Endpoints, DTOs oder Datenbankfelder ändern sich?
     Was müssen andere Teams oder Clients anpassen? -->

---

## Wie wurde getestet?

<!-- Beschreibe die konkreten Schritte, mit denen du das Feature geprüft hast.
     Ziel: Der Reviewer kann den Test selbst nachvollziehen. -->

**Testschritte:**
1. 
2. 

**Automatisierte Tests:**
- [ ] Unit Tests laufen grün (`npm run test`)
- [ ] Kein TypeScript-Fehler (`npm run build`)
- [ ] Lokal getestet (Frontend + Backend gestartet)

---

## Screenshots / Demo

<!-- Bei UI-Änderungen: Before/After Screenshots oder kurze Demo (GIF/Video).
     Bei reinen Backend-Änderungen: diesen Block löschen. -->

| Vorher | Nachher |
|--------|---------|
|        |         |

---

## Checkliste

- [ ] Code ist review-ready (kein auskommentierter Code, keine TODOs ohne Ticket)
- [ ] Neue Umgebungsvariablen sind in `.env.example` dokumentiert
- [ ] Datenbankmigrationen sind enthalten falls Schema geändert wurde
- [ ] Keine `console.log`-Statements im produktiven Code
- [ ] Breaking Changes sind oben dokumentiert (falls zutreffend)
