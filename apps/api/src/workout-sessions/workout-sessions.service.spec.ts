import { Test, TestingModule } from "@nestjs/testing";
import { WorkoutSessionsService } from "./workout-sessions.service";
import { PrismaService } from "../prisma/prisma.service";

// Mock für PrismaService – Tests dürfen keine echte Datenbank treffen.
const mockPrisma = {
  workoutSession: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  trainerClient: {
    findFirst: jest.fn(),
  },
  sessionComment: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  set: {
    count: jest.fn(),
    create: jest.fn(),
  },
};

describe("WorkoutSessionsService", () => {
  let service: WorkoutSessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutSessionsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<WorkoutSessionsService>(WorkoutSessionsService);
    jest.clearAllMocks();
  });

  // ─── getExerciseProgress ────────────────────────────────────

  describe("getExerciseProgress", () => {
    it("gibt leere Liste zurück, wenn keine Sessions existieren", async () => {
      mockPrisma.workoutSession.findMany.mockResolvedValue([]);

      const result = await service.getExerciseProgress("user-1", "ex-1");

      expect(result).toEqual([]);
    });

    it("filtert Sessions ohne Sets für die gesuchte Übung heraus", async () => {
      mockPrisma.workoutSession.findMany.mockResolvedValue([
        { id: "s-1", date: new Date("2026-01-01"), sets: [] },
        { id: "s-2", date: new Date("2026-01-08"), sets: [{ weightKg: 80, order: 1, reps: 5 }] },
      ]);

      const result = await service.getExerciseProgress("user-1", "ex-1");

      expect(result).toHaveLength(1);
      expect(result[0].sessionId).toBe("s-2");
    });

    it("berechnet das maximale Gewicht pro Session korrekt", async () => {
      mockPrisma.workoutSession.findMany.mockResolvedValue([
        {
          id: "s-1",
          date: new Date("2026-01-01"),
          sets: [
            { weightKg: 70, order: 1, reps: 5 },
            { weightKg: 80, order: 2, reps: 5 },
            { weightKg: 75, order: 3, reps: 5 },
          ],
        },
      ]);

      const result = await service.getExerciseProgress("user-1", "ex-1");

      expect(result[0].maxWeightKg).toBe(80);
    });

    it("behandelt Übungen ohne Gewicht (Körpergewicht) als 0 kg", async () => {
      mockPrisma.workoutSession.findMany.mockResolvedValue([
        {
          id: "s-1",
          date: new Date("2026-01-01"),
          sets: [{ weightKg: null, order: 1, reps: 10 }],
        },
      ]);

      const result = await service.getExerciseProgress("user-1", "ex-1");

      expect(result[0].maxWeightKg).toBe(0);
    });
  });

  // ─── addComment ─────────────────────────────────────────────

  describe("addComment", () => {
    it("gibt null zurück, wenn die Session nicht existiert", async () => {
      mockPrisma.workoutSession.findUnique.mockResolvedValue(null);

      const result = await service.addComment("session-x", "trainer-1", "Gute Arbeit!");

      expect(result).toBeNull();
      expect(mockPrisma.sessionComment.create).not.toHaveBeenCalled();
    });

    it("gibt null zurück, wenn der Trainer keine aktive Beziehung zum Client hat", async () => {
      mockPrisma.workoutSession.findUnique.mockResolvedValue({
        id: "s-1",
        userId: "client-1",
      });
      mockPrisma.trainerClient.findFirst.mockResolvedValue(null);

      const result = await service.addComment("s-1", "trainer-1", "Gute Arbeit!");

      expect(result).toBeNull();
      expect(mockPrisma.sessionComment.create).not.toHaveBeenCalled();
    });

    it("erstellt Kommentar, wenn Trainer eine aktive Verbindung zum Client hat", async () => {
      mockPrisma.workoutSession.findUnique.mockResolvedValue({
        id: "s-1",
        userId: "client-1",
      });
      mockPrisma.trainerClient.findFirst.mockResolvedValue({
        id: "tc-1",
        status: "ACTIVE",
      });
      mockPrisma.sessionComment.create.mockResolvedValue({
        id: "c-1",
        text: "Gute Arbeit!",
        trainer: { id: "trainer-1", name: "Coach Max" },
      });

      const result = await service.addComment("s-1", "trainer-1", "Gute Arbeit!");

      expect(mockPrisma.sessionComment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sessionId: "s-1",
            trainerId: "trainer-1",
            text: "Gute Arbeit!",
          }),
        })
      );
      expect(result).not.toBeNull();
    });
  });

  // ─── getComments ────────────────────────────────────────────

  describe("getComments", () => {
    it("gibt null zurück, wenn die Session nicht dem User gehört", async () => {
      mockPrisma.workoutSession.findFirst.mockResolvedValue(null);

      const result = await service.getComments("session-x", "user-1");

      expect(result).toBeNull();
    });

    it("gibt leere Liste zurück, wenn noch keine Kommentare existieren", async () => {
      mockPrisma.workoutSession.findFirst.mockResolvedValue({ id: "s-1" });
      mockPrisma.sessionComment.findMany.mockResolvedValue([]);

      const result = await service.getComments("s-1", "user-1");

      expect(result).toEqual([]);
    });

    it("gibt alle Kommentare mit Trainer-Info zurück", async () => {
      mockPrisma.workoutSession.findFirst.mockResolvedValue({ id: "s-1" });
      mockPrisma.sessionComment.findMany.mockResolvedValue([
        { id: "c-1", text: "Super!", trainer: { id: "t-1", name: "Coach Max" } },
        { id: "c-2", text: "Mehr Fokus auf Technik.", trainer: { id: "t-1", name: "Coach Max" } },
      ]);

      const result = await service.getComments("s-1", "user-1");

      expect(result).toHaveLength(2);
      expect(result![0].text).toBe("Super!");
    });
  });
});
