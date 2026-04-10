import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

// PrismaService extends PrismaClient – it IS a Prisma client,
// plus it automatically connects when NestJS starts the app.
//
// By making this a NestJS Injectable, every other service in the
// backend can "inject" it and get access to the database.
// This is called Dependency Injection – a core NestJS concept.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // This runs automatically when the NestJS module is loaded.
    // It opens the connection to the PostgreSQL database.
    await this.$connect();
  }
}
