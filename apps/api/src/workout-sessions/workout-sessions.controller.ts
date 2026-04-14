import {
  Controller, Get, Post, Body, Param,
  Request, UseGuards, NotFoundException,
} from "@nestjs/common";
import { WorkoutSessionsService } from "./workout-sessions.service";
import { AuthGuard } from "../auth/auth.guard";

@UseGuards(AuthGuard)
@Controller("workout-sessions")
export class WorkoutSessionsController {
  constructor(private readonly workoutSessionsService: WorkoutSessionsService) {}

  // GET /workout-sessions – all sessions for the logged-in user
  @Get()
  findAll(@Request() req: any) {
    return this.workoutSessionsService.findAllForUser(req.user.id);
  }

  // GET /workout-sessions/:id – one session with all its sets
  @Get(":id")
  async findOne(@Param("id") id: string, @Request() req: any) {
    const session = await this.workoutSessionsService.findOne(id, req.user.id);
    if (!session) throw new NotFoundException("Session not found");
    return session;
  }

  // POST /workout-sessions – start a new session
  // Body: { "planId": "abc123" } or {} for a planless session
  @Post()
  create(
    @Request() req: any,
    @Body() body: { planId?: string; notes?: string },
  ) {
    return this.workoutSessionsService.create(req.user.id, body);
  }

  // POST /workout-sessions/:id/sets – log a set in an existing session
  // Body: { "exerciseId": "xyz", "reps": 8, "weightKg": 80 }
  @Post(":id/sets")
  async addSet(
    @Param("id") id: string,
    @Request() req: any,
    @Body() body: { exerciseId: string; reps: number; weightKg?: number; notes?: string },
  ) {
    const result = await this.workoutSessionsService.addSet(id, req.user.id, body);
    if (!result) throw new NotFoundException("Session not found");
    return result;
  }
}
