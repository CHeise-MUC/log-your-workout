import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

// The root module – think of it as the "table of contents" of the API.
// Every feature we add later (workouts, exercises, users) will be
// registered here as its own module.
@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
