import { Module } from "@nestjs/common";
import { AuthGuard } from "./auth.guard";
import { SupabaseModule } from "../supabase/supabase.module";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [SupabaseModule, PrismaModule],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
