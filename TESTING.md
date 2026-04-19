# Testing-Regeln – Log my Workout

Dieses Dokument definiert den verbindlichen Standard für Unit-Tests im Projekt **Log my Workout**.

---

## Grundregel

**Jedes neue Modul bekommt sofort Unit-Tests.**

Unit-Tests werden nicht nachträglich ergänzt – sie werden parallel zur Implementierung geschrieben, bevor der Code committed wird. Ein Modul ohne Tests gilt als unfertig.

---

## Was wird getestet?

Der Fokus liegt auf der **Service-Schicht im Backend**. Dort sitzt die Business-Logik – und das ist der Teil, der bei Refactoring am häufigsten still kaputtgeht.

Testpflicht besteht für:

- Alle `*.service.ts`-Dateien im Backend (NestJS)
- Jede öffentliche Methode eines Services
- Edge Cases: leere Listen, nicht gefundene Ressourcen, fehlende Berechtigungen

Controller-Tests und Frontend-Tests sind optional und werden nach Bedarf ergänzt.

---

## Technologie

- **Test-Runner:** Jest (bereits in NestJS integriert, kein zusätzliches Setup nötig)
- **Mocking:** Prisma wird gemockt – Tests dürfen keine echte Datenbank treffen
- **Dateiname:** `*.service.spec.ts` im selben Ordner wie die getestete Datei

---

## Struktur eines Service-Tests

```typescript
// Beispiel: trainer.service.spec.ts

import { Test, TestingModule } from "@nestjs/testing";
import { TrainerService } from "./trainer.service";
import { PrismaService } from "../prisma/prisma.service";

// Mock für PrismaService: Alle Methoden werden durch Jest-Fakes ersetzt.
// So treffen Tests keine echte Datenbank.
const mockPrisma = {
  trainerClient: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  // weitere Modelle nach Bedarf
};

describe("TrainerService", () => {
  let service: TrainerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrainerService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TrainerService>(TrainerService);
    jest.clearAllMocks(); // Mocks zwischen Tests zurücksetzen
  });

  describe("addClientByEmail", () => {
    it("gibt Fehler zurück, wenn Trainer sich selbst einlädt", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "trainer-1",
        email: "trainer@example.com",
      });

      const result = await service.addClientByEmail("trainer-1", "trainer@example.com");

      expect(result).toEqual({ error: "You cannot add yourself as a client." });
    });

    it("erstellt eine PENDING-Verbindung, auch wenn Kunde bereits ein Konto hat", async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce({ id: "trainer-1", email: "trainer@example.com" })
        .mockResolvedValueOnce({ id: "client-1", email: "client@example.com" });
      mockPrisma.trainerClient.findFirst.mockResolvedValue(null);
      mockPrisma.trainerClient.create.mockResolvedValue({
        id: "tc-1",
        status: "PENDING",
      });

      const result = await service.addClientByEmail("trainer-1", "client@example.com");

      expect(mockPrisma.trainerClient.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: "PENDING" }) }),
      );
    });
  });
});
```

---

## Tests ausführen

```bash
# Alle Tests einmalig ausführen
cd apps/api
npm run test

# Tests im Watch-Modus (während der Entwicklung)
npm run test:watch

# Mit Coverage-Report
npm run test:cov
```

---

## Checkliste vor jedem Commit (neues Modul)

- [ ] `*.service.spec.ts` existiert für jeden neuen Service
- [ ] Alle öffentlichen Methoden haben mindestens einen Happy-Path-Test
- [ ] Edge Cases (leere Ergebnisse, fehlende Rechte) sind abgedeckt
- [ ] `npm run test` läuft ohne Fehler durch
