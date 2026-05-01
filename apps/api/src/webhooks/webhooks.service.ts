import { Injectable, Logger } from "@nestjs/common";
import * as crypto from "crypto";

// WebhooksService handles signature verification for incoming webhook payloads.
//
// Why HMAC verification?
// Without it, anyone could send a POST to /v1/webhooks/stripe and trigger
// premium activations or other privileged actions. The webhook secret is shared
// only between Stripe and our backend – stored in an environment variable.
@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  // Verifies a Stripe webhook signature.
  // Stripe signs every payload with HMAC-SHA256 using our webhook secret.
  // The signature header format is: "t=<timestamp>,v1=<hmac>"
  verifyStripeSignature(rawBody: Buffer, signatureHeader: string): boolean {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secret) {
      this.logger.error("STRIPE_WEBHOOK_SECRET is not set – webhook verification skipped");
      // In development without Stripe configured, allow through.
      // In production this env var must be set.
      return process.env.NODE_ENV !== "production";
    }

    try {
      const parts = signatureHeader.split(",");
      const timestamp = parts.find((p) => p.startsWith("t="))?.split("=")[1];
      const receivedHmac = parts.find((p) => p.startsWith("v1="))?.split("=")[1];

      if (!timestamp || !receivedHmac) return false;

      // Stripe's signing scheme: HMAC-SHA256("timestamp.rawBody", secret)
      const payload = `${timestamp}.${rawBody.toString("utf8")}`;
      const expectedHmac = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

      // Use timingSafeEqual to prevent timing attacks
      const expected = Buffer.from(expectedHmac, "hex");
      const received = Buffer.from(receivedHmac, "hex");

      if (expected.length !== received.length) return false;
      return crypto.timingSafeEqual(expected, received);
    } catch {
      this.logger.error("Error verifying Stripe signature");
      return false;
    }
  }
}
