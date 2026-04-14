import { Module } from "@nestjs/common";
import { ExercisesController } from "./exercises.controller";
import { ExercisesService } from "./exercises.service";
import { PrismaModule } from "../prisma/prisma.module";
import { SupabaseModule } from "../supabase/supabase.module";
import { AuthModule } from "../auth/auth.module";

// A Module bundles Controller and Service together.
// It also imports the modules it depends on:
// - PrismaModule: so the Service can talk to the database
// - SupabaseModule + AuthModule: so the AuthGuard works in this module
@Module({
  imports: [PrismaModule, SupabaseModule, AuthModule],
  controllers: [ExercisesController],
  providers: [ExercisesService],
})
export class ExercisesModule {}
