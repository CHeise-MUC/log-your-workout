import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { TrainerService } from "./trainer.service";
import { AuthGuard } from "../auth/auth.guard";
import { TrainerGuard } from "./trainer.guard";

// All routes in this controller require:
//   1. A valid JWT token (AuthGuard)
//   2. The TRAINER role (TrainerGuard)
// Guards run in order: AuthGuard first (sets req.user), then TrainerGuard (checks role).
@ApiTags("Trainer")
@ApiBearerAuth("JWT")
@UseGuards(AuthGuard, TrainerGuard)
@Controller("trainer")
export class TrainerController {
  constructor(private readonly trainerService: TrainerService) {}

  // GET /trainer/clients
  // Returns the trainer's full client list (active + pending).
  @Get("clients")
  getClients(@Request() req: any) {
    return this.trainerService.getClients(req.user.id);
  }

  // POST /trainer/clients
  // Adds a client by email address.
  // Body: { "email": "client@example.com" }
  @Post("clients")
  async addClient(@Request() req: any, @Body() body: { email: string }) {
    if (!body.email) throw new BadRequestException("Email is required");

    const result = await this.trainerService.addClientByEmail(
      req.user.id,
      body.email,
    );

    // The service returns { error: "..." } for business logic errors
    if ("error" in result) throw new BadRequestException(result.error);
    return result;
  }

  // GET /trainer/clients/:clientId/progress
  // Returns all workout sessions and sets of a specific client.
  // Only works if the client belongs to this trainer.
  @Get("clients/:clientId/progress")
  async getClientProgress(
    @Param("clientId") clientId: string,
    @Request() req: any,
  ) {
    const progress = await this.trainerService.getClientProgress(
      req.user.id,
      clientId,
    );
    if (!progress) throw new NotFoundException("Client not found");
    return progress;
  }

  // GET /trainer/assignments
  // Returns all plan assignments this trainer has made.
  @Get("assignments")
  getAssignments(@Request() req: any) {
    return this.trainerService.getAssignments(req.user.id);
  }

  // POST /trainer/assignments
  // Assigns one of the trainer's plans to a client.
  // Body: { "planId": "...", "clientId": "..." }
  @Post("assignments")
  async assignPlan(
    @Request() req: any,
    @Body() body: { planId: string; clientId: string },
  ) {
    if (!body.planId || !body.clientId) {
      throw new BadRequestException("planId and clientId are required");
    }

    const result = await this.trainerService.assignPlan(
      req.user.id,
      body.planId,
      body.clientId,
    );

    if ("error" in result) throw new BadRequestException(result.error);
    return result;
  }
}
