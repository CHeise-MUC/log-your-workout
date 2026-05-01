import {
  Controller,
  Post,
  Headers,
  Body,
  RawBodyRequest,
  Req,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Request } from "express";
import { WebhooksService } from "./webhooks.service";

// Webhooks are inbound HTTP calls from external services (e.g. Stripe).
// They are NOT protected by AuthGuard – Stripe has no user JWT.
// Instead, each provider signs its payload with a secret (HMAC-SHA256).
// We verify the signature before processing anything.
@ApiTags("Webhooks")
@Controller("webhooks")
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  // POST /v1/webhooks/stripe
  // Stripe sends payment events here (subscription created, payment failed, etc.).
  // The raw body is required for HMAC signature verification – do not parse as JSON first.
  @ApiOperation({ summary: "Stripe webhook events empfangen" })
  @ApiResponse({ status: 200, description: "Event verarbeitet" })
  @ApiResponse({ status: 401, description: "Ungültige Signatur" })
  @Post("stripe")
  async handleStripe(
    @Headers("stripe-signature") signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const rawBody = req.rawBody;

    if (!rawBody || !signature) {
      throw new UnauthorizedException("Missing body or signature");
    }

    const isValid = this.webhooksService.verifyStripeSignature(rawBody, signature);

    if (!isValid) {
      this.logger.warn("Stripe webhook received with invalid signature");
      throw new UnauthorizedException("Invalid Stripe signature");
    }

    // TODO: SCRUM-XX – parse event type and dispatch to domain services
    // e.g. case "customer.subscription.created" → activate premium features
    this.logger.log("Stripe webhook verified successfully");
    return { received: true };
  }
}
