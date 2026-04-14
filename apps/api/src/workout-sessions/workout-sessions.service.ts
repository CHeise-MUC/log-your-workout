import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

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
