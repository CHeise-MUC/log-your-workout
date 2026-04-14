import { Module } from "@nestjs/common";
import { TrainingPlansController } from "./training-plans.controller";
import { TrainingPlansService } from "./training-plans.service";
import { PrismaModule } from "../prisma/prisma.module";
import { SupabaseModule } from "../supabase/supabase.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [PrismaModule, SupabaseModule, AuthModule],
  controllers: [TrainingPlansController],
  providers: [TrainingPlansService],
})
export class TrainingPlansModule {}
