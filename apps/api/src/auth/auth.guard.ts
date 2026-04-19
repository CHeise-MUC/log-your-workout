import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { PrismaService } from "../prisma/prisma.service";

// A Guard in NestJS implements CanActivate.
// canActivate() returns true (allow) or throws an error (deny).
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private supabase: SupabaseService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Step 1: Extract the token from the Authorization header.
    // Requests look like: Authorization: Bearer eyJhbGci...
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException("No token provided");
    }

    // Step 2: Ask Supabase: "Is this token real and not expired?"
    const supabaseUser = await this.supabase.getUserFromToken(token);
    if (!supabaseUser) {
      throw new UnauthorizedException("Invalid or expired token");
    }

    // Step 3: Sync with our own User table.
    // upsert = "update if exists, insert if not" – one operation, no duplicates.
    const dbUser = await this.prisma.user.upsert({
      where: { id: supabaseUser.id },
      update: {}, // nothing to update on repeat visits
      create: {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: supabaseUser.user_metadata?.name ?? null,
      },
    });

    // Step 4: Link any pending trainer invitations that were sent to this email.
    // Runs on every request, but is idempotent: after the first link,
    // no records with clientId = null for this email will remain.
    await this.prisma.trainerClient.updateMany({
      where: { inviteEmail: dbUser.email, clientId: null },
      data: { clientId: dbUser.id },
    });

    // Step 5: Attach the database user to the request.
    // Controllers can now access request.user to know who is calling.
    request.user = dbUser;

    return true;
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers?.authorization;
    if (!authHeader) return null;

    // Format: "Bearer <token>"
    const [type, token] = authHeader.split(" ");
    return type === "Bearer" ? token : null;
  }
}
