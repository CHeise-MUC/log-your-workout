import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ExercisesService } from "./exercises.service";
import { AuthGuard } from "../auth/auth.guard";

// The Controller defines the API routes.
// @Controller("exercises") means all routes here start with /v1/exercises.
// @UseGuards(AuthGuard) on the class means EVERY route in this controller
// requires a valid JWT token – no exceptions.
@ApiTags("Exercises")
@ApiBearerAuth("JWT")
@UseGuards(AuthGuard)
@Controller("exercises")
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  // GET /v1/exercises – returns all exercises
  @ApiOperation({ summary: "Alle Übungen abrufen" })
  @ApiResponse({ status: 200, description: "Liste aller Übungen" })
  @Get()
  findAll() {
    return this.exercisesService.findAll();
  }

  // POST /v1/exercises – creates a new exercise
  // @Body() extracts the JSON from the request body.
  // Example request body: { "name": "Bankdrücken", "muscleGroup": "Brust" }
  @ApiOperation({ summary: "Neue Übung anlegen" })
  @ApiResponse({ status: 201, description: "Übung erfolgreich erstellt" })
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
