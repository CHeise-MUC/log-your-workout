import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Request,
  UseGuards,
  BadRequestException,
  NotFoundException,
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

  // GET /users/me/invitations
  // Returns all pending trainer invitations for the logged-in user.
  // An invitation stays PENDING until the user accepts it explicitly.
  @Get("me/invitations")
  getPendingInvitations(@Request() req: any) {
    return this.usersService.getPendingInvitations(req.user.id);
  }

  // PATCH /users/me/invitations/:id/accept
  // Accepts a specific pending invitation by setting its status to ACTIVE.
  @Patch("me/invitations/:id/accept")
  async acceptInvitation(@Request() req: any, @Param("id") id: string) {
    const result = await this.usersService.acceptInvitation(req.user.id, id);
    if (!result) throw new NotFoundException("Invitation not found");
    return result;
  }

  // GET /users/me/assigned-plans
  // Returns all training plans that trainers have assigned to this user.
  // This is the client-side view of the trainer–client relationship.
  @Get("me/assigned-plans")
  getAssignedPlans(@Request() req: any) {
    return this.usersService.getAssignedPlans(req.user.id);
  }
}
