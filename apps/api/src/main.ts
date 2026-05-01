import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  // rawBody: true preserves the original request buffer alongside the parsed JSON.
  // Required for webhook signature verification (Stripe HMAC-SHA256).
  // Without this, the raw bytes are gone after JSON parsing and signatures can't be verified.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Allow the frontend (running on port 3000) to talk to this API
  app.enableCors({
    origin: process.env.WEB_URL ?? "http://localhost:3000",
  });

  // All routes are prefixed with /v1 (e.g. GET /v1/exercises).
  // This allows breaking changes to be introduced later as /v2/* without
  // affecting existing clients (Mobile App, White-Label, Stripe webhooks).
  app.setGlobalPrefix("v1");

  // Swagger / OpenAPI – interactive API documentation at /api/docs.
  // NestJS generates this automatically from the decorators in each controller.
  // Open http://localhost:3001/api/docs to explore and test all endpoints.
  const config = new DocumentBuilder()
    .setTitle("Log Your Workout API")
    .setDescription(
      "REST API for the Log Your Workout app. All endpoints require a Bearer token unless marked as public.",
    )
    .setVersion("1.0")
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      "JWT",
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  console.log(`API is running on http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
