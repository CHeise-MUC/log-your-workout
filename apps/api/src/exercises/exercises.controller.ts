import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { ExercisesService } from "./exercises.service";
import { AuthGuard } from "../auth/auth.guard";

// The Controller defines the API routes.
// @Controller("exercises") means all routes here start with /exercises.
// @UseGuards(AuthGuard) on the class means EVERY route in this controller
// requires a valid JWT token – no exceptions.
@UseGuards(AuthGuard)
@Controller("exercises")
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  // GET /exercises – returns all exercises
  @Get()
  findAll() {
    return this.exercisesService.findAll();
  }

  // POST /exercises – creates a new exercise
  // @Body() extracts the JSON from the request body.
  // Example request body: { "name": "Bankdrücken", "muscleGroup": "Brust" }
  @Post()
  create(
    @Body()
    body: {
      name: string;
      muscleGroup: string;
      description?: string;
    },
  ) {
    return this.exercisesService.create(body);
  }
}
