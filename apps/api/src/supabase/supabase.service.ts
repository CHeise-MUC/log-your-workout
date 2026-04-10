import { Injectable } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    // We use the SECRET key here – this gives admin access.
    // This key ONLY lives on the server, never in the browser.
    this.client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
    );
  }

  // Returns the admin client so other services can use it.
  getClient(): SupabaseClient {
    return this.client;
  }

  // Verifies a JWT token and returns the Supabase user if valid.
  // This is the core of our authentication: "is this token real?"
  async getUserFromToken(token: string) {
    const {
      data: { user },
      error,
    } = await this.client.auth.getUser(token);

    if (error || !user) return null;
    return user;
  }
}
