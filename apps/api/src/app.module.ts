import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { SupabaseModule } from "./supabase/supabase.module";
import { AuthModule } from "./auth/auth.module";

// The root module – the "table of contents" of the API.
// Every feature we add (workouts, exercises, users) gets registered here.
@Module({
  imports: [
    PrismaModule,    // database access
    SupabaseModule,  // Supabase admin client
    AuthModule,      // JWT auth guard
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
