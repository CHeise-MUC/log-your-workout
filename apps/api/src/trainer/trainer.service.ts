import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class TrainerService {
  constructor(private prisma: PrismaService) {}

  // ── CLIENT MANAGEMENT ──────────────────────────────────────

  // Returns all clients of a trainer, including their basic profile.
  // Covers both active connections and pending invitations.
  async getClients(trainerId: string) {
    return this.prisma.trainerClient.findMany({
      where: { trainerId },
      include: {
        client: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Adds a client to a trainer's roster by email address.
  //
  // Two cases:
  //   1. Client already has an account → connection is immediately ACTIVE
  //   2. Client has no account yet     → connection is PENDING; inviteEmail
  //      is stored so we can activate it when they register later
  async addClientByEmail(trainerId: string, email: string) {
    // Prevent a trainer from adding themselves as a client
    const trainer = await this.prisma.user.findUnique({
      where: { id: trainerId },
    });
    if (trainer?.email === email) {
      return { error: "You cannot add yourself as a client." };
    }

    // Check whether a connection already exists (active or pending)
    const existing = await this.prisma.trainerClient.findFirst({
      where: {
        trainerId,
        OR: [
          { client: { email } },
          { inviteEmail: email },
        ],
      },
    });
    if (existing) {
      return { error: "Client already connected or invited." };
    }

    // Look up whether the client already has an account
    const clientUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (clientUser) {
      // Client exists → create a PENDING connection.
      // The client must explicitly accept in the app before becoming ACTIVE.
      return this.prisma.trainerClient.create({
        data: {
          trainerId,
          clientId: clientUser.id,
          inviteEmail: email,
          status: "PENDING",
        },
        include: {
          client: { select: { id: true, name: true, email: true } },
        },
      });
    } else {
      // Client does not exist yet → store a pending invitation by email.
      // When they register, auth.guard.ts links their userId to this record.
      // They still need to accept explicitly before becoming ACTIVE.
      return this.prisma.trainerClient.create({
        data: {
          trainerId,
          clientId: null,
          inviteEmail: email,
          status: "PENDING",
        },
      });
    }
  }

  // ── PLAN ASSIGNMENT ────────────────────────────────────────

  // Assigns one of the trainer's plans to a specific client.
  // Validates that:
  //   - the plan belongs to the trainer
  //   - the client is an active client of this trainer
  async assignPlan(trainerId: string, planId: string, clientId: string) {
    // Confirm the plan belongs to this trainer
    const plan = await this.prisma.trainingPlan.findFirst({
      where: { id: planId, userId: trainerId },
    });
    if (!plan) return { error: "Plan not found or not owned by you." };

    // Confirm the client is actively connected to this trainer
    const connection = await this.prisma.trainerClient.findFirst({
      where: { trainerId, clientId, status: "ACTIVE" },
    });
    if (!connection) return { error: "Client not found or not active." };

    // @@unique([planId, clientId]) in the schema prevents duplicates
    return this.prisma.planAssignment.create({
      data: { planId, trainerId, clientId },
      include: {
        plan: { select: { name: true } },
        client: { select: { name: true, email: true } },
      },
    });
  }

  // Returns all plan assignments made by this trainer
  async getAssignments(trainerId: string) {
    return this.prisma.planAssignment.findMany({
      where: { trainerId },
      include: {
        plan: { select: { id: true, name: true } },
        client: { select: { id: true, name: true, email: true } },
      },
      orderBy: { assignedAt: "desc" },
    });
  }

  // ── CLIENT PROGRESS ────────────────────────────────────────

  // Returns all workout sessions of a specific client,
  // but only if they are an active client of this trainer.
  // This protects client data from being accessed by unauthorized trainers.
  async getClientProgress(trainerId: string, clientId: string) {
    // Authorization check: is this person actually my client?
    const connection = await this.prisma.trainerClient.findFirst({
      where: { trainerId, clientId, status: "ACTIVE" },
    });
    if (!connection) return null;

    return this.prisma.workoutSession.findMany({
      where: { userId: clientId },
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
}
