import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow the frontend (running on port 3000) to talk to this API
  app.enableCors({
    origin: process.env.WEB_URL ?? "http://localhost:3000",
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  console.log(`API is running on http://localhost:${port}`);
}

bootstrap();
