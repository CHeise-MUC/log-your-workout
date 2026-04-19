import {
  Controller,
  Get,
  Patch,
  Body,
  Request,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { AuthGuard } from "../auth/auth.guard";
import { Role } from "@prisma/client";

@UseGuards(AuthGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users/me
  // Returns the profile of the currently logged-in user, including their role.
  @Get("me")
  getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  // PATCH /users/me/role
  // Allows a user to switch their own role between USER and TRAINER.
  // Body: { "role": "TRAINER" } or { "role": "USER" }
  @Patch("me/role")
  async updateRole(@Request() req: any, @Body() body: { role: Role }) {
    const validRoles: Role[] = ["USER", "TRAINER"];
    if (!validRoles.includes(body.role)) {
      throw new BadRequestException("Role must be USER or TRAINER");
    }
    return this.usersService.updateRole(req.user.id, body.role);
  }

  // GET /users/me/assigned-plans
  // Returns all training plans that trainers have assigned to this user.
  // This is the client-side view of the trainer–client relationship.
  @Get("me/assigned-plans")
  getAssignedPlans(@Request() req: any) {
    return this.usersService.getAssignedPlans(req.user.id);
  }
}
