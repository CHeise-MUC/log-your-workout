import { Controller, Get, Post, Body, Request, UseGuards } from "@nestjs/common";
import { TrainingPlansService } from "./training-plans.service";
import { AuthGuard } from "../auth/auth.guard";
import { Visibility } from "@prisma/client";

@UseGuards(AuthGuard)
@Controller("training-plans")
export class TrainingPlansController {
  constructor(private readonly trainingPlansService: TrainingPlansService) {}

  // GET /training-plans
  // Returns only the plans of the logged-in user.
  // req.user is set by the AuthGuard.
  @Get()
  findMine(@Request() req: any) {
    return this.trainingPlansService.findAllForUser(req.user.id);
  }

  // GET /training-plans/public
  // Returns all public plans from all users – the discovery feed.
  // Still requires login (no anonymous browsing).
  @Get("public")
  findPublic() {
    return this.trainingPlansService.findAllPublic();
  }

  // POST /training-plans
  // Creates a new plan for the logged-in user.
  // Example body: { "name": "Push Day", "visibility": "PUBLIC" }
  @Post()
  create(
    @Request() req: any,
    @Body()
    body: {
      name: string;
      description?: string;
      visibility: Visibility;
    },
  ) {
    return this.trainingPlansService.create(req.user.id, body);
  }
}
