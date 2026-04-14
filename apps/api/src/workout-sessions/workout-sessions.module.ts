import { Module } from "@nestjs/common";
import { WorkoutSessionsController } from "./workout-sessions.controller";
import { WorkoutSessionsService } from "./workout-sessions.service";
import { PrismaModule } from "../prisma/prisma.module";
import { SupabaseModule } from "../supabase/supabase.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [PrismaModule, SupabaseModule, AuthModule],
  controllers: [WorkoutSessionsController],
  providers: [WorkoutSessionsService],
})
export class WorkoutSessionsModule {}
