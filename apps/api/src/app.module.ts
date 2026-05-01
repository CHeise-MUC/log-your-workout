import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { SupabaseModule } from "./supabase/supabase.module";
import { AuthModule } from "./auth/auth.module";
import { ExercisesModule } from "./exercises/exercises.module";
import { TrainingPlansModule } from "./training-plans/training-plans.module";
import { WorkoutSessionsModule } from "./workout-sessions/workout-sessions.module";
import { TrainerModule } from "./trainer/trainer.module";
import { UsersModule } from "./users/users.module";
import { WebhooksModule } from "./webhooks/webhooks.module";

// The root module – the "table of contents" of the API.
// Every feature we add (workouts, exercises, users) gets registered here.
@Module({
  imports: [
    PrismaModule,            // database access
    SupabaseModule,          // Supabase admin client
    AuthModule,              // JWT auth guard
    ExercisesModule,         // exercises: GET /v1/exercises, POST /v1/exercises
    TrainingPlansModule,     // training plans: GET /v1/training-plans, POST /v1/training-plans
    WorkoutSessionsModule,   // workout sessions: GET/POST /v1/workout-sessions
    UsersModule,             // user profile & role management: GET/PATCH /v1/users/me
    TrainerModule,           // trainer area (role-protected): GET/POST /v1/trainer/*
    WebhooksModule,          // inbound webhooks: POST /v1/webhooks/stripe
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
