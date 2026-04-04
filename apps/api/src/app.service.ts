import { Injectable } from "@nestjs/common";

// A Service contains the business logic.
// Controllers handle routing, Services handle the actual work.
// This separation makes the code easier to test and maintain.
@Injectable()
export class AppService {
  getHealth(): object {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "log-your-workout-api",
    };
  }
}
