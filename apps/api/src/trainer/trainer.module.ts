import { Module } from "@nestjs/common";
import { TrainerController } from "./trainer.controller";
import { TrainerService } from "./trainer.service";
import { PrismaModule } from "../prisma/prisma.module";
import { SupabaseModule } from "../supabase/supabase.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [PrismaModule, SupabaseModule, AuthModule],
  controllers: [TrainerController],
  providers: [TrainerService],
})
export class TrainerModule {}
