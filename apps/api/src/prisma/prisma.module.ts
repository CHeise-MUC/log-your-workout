import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

// By listing PrismaService in both "providers" and "exports",
// any other module that imports PrismaModule can use PrismaService.
// Think of "exports" as making something publicly available.
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
