import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

// A Controller defines the API routes (URLs).
// This one responds to GET /health – a standard "is the server alive?" check.
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("health")
  getHealth(): object {
    return this.appService.getHealth();
  }
}
