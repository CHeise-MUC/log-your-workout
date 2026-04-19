import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { PrismaModule } from "../prisma/prisma.module";
import { SupabaseModule } from "../supabase/supabase.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [PrismaModule, SupabaseModule, AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
