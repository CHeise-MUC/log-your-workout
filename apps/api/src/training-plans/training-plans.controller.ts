import {
  Controller, Get, Post, Body, Param,
  Request, UseGuards, NotFoundException,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { TrainingPlansService } from "./training-plans.service";
import { AuthGuard } from "../auth/auth.guard";
import { Visibility } from "@prisma/client";

@ApiTags("Training Plans")
@ApiBearerAuth("JWT")
@UseGuards(AuthGuard)
@Controller("training-plans")
export class TrainingPlansController {
  constructor(private readonly trainingPlansService: TrainingPlansService) {}

  // GET /training-plans
  @Get()
  findMine(@Request() req: any) {
    return this.trainingPlansService.findAllForUser(req.user.id);
  }

  // GET /training-plans/public
  @Get("public")
  findPublic() {
    return this.trainingPlansService.findAllPublic();
  }

  // GET /training-plans/:id
  // Returns one plan with all its exercises.
  // @Param("id") extracts the :id part from the URL.
  // Returns 404 if the plan doesn't exist or belongs to someone else.
  @Get(":id")
  async findOne(@Param("id") id: string, @Request() req: any) {
    const plan = await this.trainingPlansService.findOne(id, req.user.id);
    if (!plan) throw new NotFoundException("Plan not found");
    return plan;
  }

  // POST /training-plans
  @Post()
  create(
    @Request() req: any,
    @Body() body: { name: string; description?: string; visibility: Visibility },
  ) {
    return this.trainingPlansService.create(req.user.id, body);
  }

  // POST /training-plans/:id/exercises
  // Adds an exercise to a specific plan.
  // Example body: { "exerciseId": "abc123", "targetSets": 4, "targetReps": 8 }
  @Post(":id/exercises")
  async addExercise(
    @Param("id") id: string,
    @Request() req: any,
    @Body() body: { exerciseId: string; targetSets?: number; targetReps?: number },
  ) {
    const result = await this.trainingPlansService.addExercise(id, req.user.id, body);
    if (!result) throw new NotFoundException("Plan not found");
    return result;
  }
}
