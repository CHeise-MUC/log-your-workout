import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Visibility } from "@prisma/client";

@Injectable()
export class TrainingPlansService {
  constructor(private prisma: PrismaService) {}

  // Returns all plans that belong to the logged-in user.
  // Other users' plans are never returned here – even public ones.
  async findAllForUser(userId: string) {
    return this.prisma.trainingPlan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      // Include the exercise count so the frontend can flag empty plans
      include: {
        _count: { select: { planExercises: true } },
      },
    });
  }

  // Returns all PUBLIC plans from all users.
  // This is the "discover" feed – anyone can browse public plans.
  async findAllPublic() {
    return this.prisma.trainingPlan.findMany({
      where: { visibility: Visibility.PUBLIC },
      orderBy: { createdAt: "desc" },
      // Include the owner's name so we can show "by Christian Heise"
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });
  }

  // Returns a single plan with all its exercises (including exercise details).
  // Returns null if the plan doesn't exist or doesn't belong to this user.
  async findOne(planId: string, userId: string) {
    return this.prisma.trainingPlan.findFirst({
      where: {
        id: planId,
        userId, // security: only the owner can see their plan details
      },
      include: {
        planExercises: {
          orderBy: { order: "asc" },
          include: {
            // Include the full exercise data so we get name + muscleGroup
            exercise: true,
          },
        },
      },
    });
  }

  // Adds an exercise to a training plan.
  // Also verifies that the plan belongs to the user before touching it.
  async addExercise(
    planId: string,
    userId: string,
    data: { exerciseId: string; targetSets?: number; targetReps?: number },
  ) {
    // Security check: make sure the plan belongs to this user
    const plan = await this.prisma.trainingPlan.findFirst({
      where: { id: planId, userId },
    });
    if (!plan) return null;

    // Determine the next order number (place new exercise at the end)
    const count = await this.prisma.planExercise.count({
      where: { planId },
    });

    return this.prisma.planExercise.create({
      data: {
        planId,
        exerciseId: data.exerciseId,
        targetSets: data.targetSets,
        targetReps: data.targetReps,
        order: count + 1,
      },
      include: { exercise: true },
    });
  }

  // Creates a new training plan for the logged-in user.
  async create(
    userId: string,
    data: {
      name: string;
      description?: string;
      visibility: Visibility;
    },
  ) {
    return this.prisma.trainingPlan.create({
      data: {
        ...data,
        userId, // always set to the logged-in user – never trust the client for this
      },
    });
  }
}
