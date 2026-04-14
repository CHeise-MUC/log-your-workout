import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

// The Service contains the business logic.
// It talks directly to the database via Prisma.
// The Controller calls this Service – it never talks to Prisma directly.
@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  // Returns all exercises, sorted alphabetically by name.
  async findAll() {
    return this.prisma.exercise.findMany({
      orderBy: { name: "asc" },
    });
  }

  // Creates a new exercise and returns it.
  // The data shape (name, muscleGroup, description) is validated in the controller.
  async create(data: { name: string; muscleGroup: string; description?: string }) {
    return this.prisma.exercise.create({
      data,
    });
  }
}
