import { Controller, Get, Request, UseGuards } from "@nestjs/common";
import { AppService } from "./app.service";
import { AuthGuard } from "./auth/auth.guard";

// A Controller defines the API routes (URLs).
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // GET /health – a standard "is the server alive?" check.
  // No authentication required – anyone can call this.
  @Get("health")
  getHealth(): object {
    return this.appService.getHealth();
  }

  // GET /profile – returns the logged-in user's data.
  // @UseGuards(AuthGuard) means: run the AuthGuard first.
  // If the token is valid, request.user is populated and we continue.
  // If not, the Guard throws 401 Unauthorized automatically.
  @UseGuards(AuthGuard)
  @Get("profile")
  getProfile(@Request() req: any): object {
    // req.user was set by the AuthGuard (see auth.guard.ts, line 49)
    return {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
    };
  }
}
