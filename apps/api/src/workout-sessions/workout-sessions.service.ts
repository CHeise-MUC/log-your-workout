import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

// NOTE: SessionComment is a new model added in Module 13.
// The Prisma client types are regenerated automatically when running
// `npm install` (postinstall: prisma generate). Until then, we access
// the model via type cast to avoid a stale-types compile error in the sandbox.
type AnyPrisma = PrismaService & { sessionComment: any };

@Injectable()
export class WorkoutSessionsService {
  constructor(private prisma: PrismaService) {}

  // Returns all sessions for the logged-in user, newest first.
  // Includes the linked plan name and a summary of sets per session.
  async findAllForUser(userId: string) {
    return this.prisma.workoutSession.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      include: {
        plan: { select: { name: true } },
        sets: {
          include: { exercise: { select: { name: true } } },
          orderBy: { order: "asc" },
        },
      },
    });
  }

  // Returns a single session with all its sets.
  // Returns null if it doesn't exist or belongs to someone else.
  async findOne(sessionId: string, userId: string) {
    return this.prisma.workoutSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        plan: {
          include: {
            planExercises: {
              orderBy: { order: "asc" },
              include: { exercise: true },
            },
          },
        },
        sets: {
          include: { exercise: { select: { name: true, id: true } } },
          orderBy: { order: "asc" },
        },
      },
    });
  }

  // Starts a new workout session for the logged-in user.
  // planId is optional – users can also train without a plan.
  async create(userId: string, data: { planId?: string; notes?: string }) {
    return this.prisma.workoutSession.create({
      data: {
        userId,
        planId: data.planId ?? null,
        notes: data.notes,
      },
      include: {
        plan: {
          include: {
            planExercises: {
              orderBy: { order: "asc" },
              include: { exercise: true },
            },
          },
        },
        sets: true,
      },
    });
  }

  // Returns the progress history for one exercise: max weight lifted
  // per session, sorted oldest → newest. Used to draw the progress chart.
  async getExerciseProgress(userId: string, exerciseId: string) {
    const sessions = await this.prisma.workoutSession.findMany({
      where: { userId },
      orderBy: { date: "asc" },
      include: {
        sets: {
          where: { exerciseId },
        },
      },
    });

    // Filter to sessions that actually contain this exercise,
    // then map to { date, maxWeightKg } per session.
    return sessions
      .filter((s) => s.sets.length > 0)
      .map((s) => {
        const maxWeight = Math.max(...s.sets.map((set) => set.weightKg ?? 0));
        return {
          sessionId: s.id,
          date: s.date,
          maxWeightKg: maxWeight,
        };
      });
  }

  // A trainer adds a comment to one of their client's sessions.
  // Access check: trainer must have an ACTIVE relationship with the session owner.
  async addComment(
    sessionId: string,
    trainerId: string,
    text: string,
  ) {
    // Verify the session exists and get its owner
    const session = await this.prisma.workoutSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) return null;

    // Check that the trainer has an active connection to this client
    const relation = await this.prisma.trainerClient.findFirst({
      where: { trainerId, clientId: session.userId, status: "ACTIVE" },
    });
    if (!relation) return null;

    return (this.prisma as AnyPrisma).sessionComment.create({
      data: { sessionId, trainerId, text },
      include: {
        trainer: { select: { id: true, name: true } },
      },
    });
  }

  // Returns all comments for a session.
  // Users can only read comments on their own sessions.
  async getComments(sessionId: string, userId: string) {
    // Verify ownership
    const session = await this.prisma.workoutSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) return null;

    return (this.prisma as AnyPrisma).sessionComment.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      include: {
        trainer: { select: { id: true, name: true } },
      },
    });
  }

  // Logs a single set within an existing session.
  async addSet(
    sessionId: string,
    userId: string,
    data: { exerciseId: string; reps: number; weightKg?: number; notes?: string },
  ) {
    // Security check: confirm the session belongs to this user
    const session = await this.prisma.workoutSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) return null;

    // Determine the order number for this set within this exercise in this session
    const count = await this.prisma.set.count({
      where: { sessionId, exerciseId: data.exerciseId },
    });

    return this.prisma.set.create({
      data: {
        sessionId,
        exerciseId: data.exerciseId,
        reps: data.reps,
        weightKg: data.weightKg,
        notes: data.notes,
        order: count + 1,
      },
      // id is required so the frontend can group the set under the correct exercise
      include: { exercise: { select: { name: true, id: true } } },
    });
  }
}
