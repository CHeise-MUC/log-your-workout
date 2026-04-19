import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";

// TrainerGuard ensures that only users with role = TRAINER can access
// the /trainer endpoints. It must always run AFTER AuthGuard, because
// AuthGuard is responsible for populating req.user (including the role).
//
// Usage: @UseGuards(AuthGuard, TrainerGuard)
@Injectable()
export class TrainerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // req.user is set by AuthGuard from the database record,
    // so req.user.role reflects the actual stored role.
    if (request.user?.role !== "TRAINER") {
      throw new ForbiddenException(
        "Access denied: Trainer role required",
      );
    }

    return true;
  }
}
