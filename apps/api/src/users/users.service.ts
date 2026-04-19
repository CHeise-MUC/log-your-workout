import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "@prisma/client";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Returns the full profile of the logged-in user, including their role.
  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  // Switches the user's role between USER and TRAINER.
  // This is a self-service action – no admin approval required in this version.
  async updateRole(userId: string, role: Role) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  // Returns all training plans that have been assigned to this user by a trainer.
  // Each entry includes the plan details and who assigned it.
  async getAssignedPlans(userId: string) {
    return this.prisma.planAssignment.findMany({
      where: { clientId: userId },
      include: {
        plan: {
          include: {
            planExercises: {
              orderBy: { order: "asc" },
              include: { exercise: true },
            },
          },
        },
        trainer: { select: { name: true, email: true } },
      },
      orderBy: { assignedAt: "desc" },
    });
  }
}
