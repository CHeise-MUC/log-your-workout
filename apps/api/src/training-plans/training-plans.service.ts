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
