import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { SupabaseModule } from "./supabase/supabase.module";
import { AuthModule } from "./auth/auth.module";
import { ExercisesModule } from "./exercises/exercises.module";
import { TrainingPlansModule } from "./training-plans/training-plans.module";
import { WorkoutSessionsModule } from "./workout-sessions/workout-sessions.module";

// The root module – the "table of contents" of the API.
// Every feature we add (workouts, exercises, users) gets registered here.
@Module({
  imports: [
    PrismaModule,            // database access
    SupabaseModule,          // Supabase admin client
    AuthModule,              // JWT auth guard
    ExercisesModule,         // exercises: GET /exercises, POST /exercises
    TrainingPlansModule,     // training plans: GET /training-plans, POST /training-plans
    WorkoutSessionsModule,   // workout sessions: GET/POST /workout-sessions
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
