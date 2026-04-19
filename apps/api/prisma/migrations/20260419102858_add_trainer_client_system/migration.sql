-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'TRAINER');

-- CreateEnum
CREATE TYPE "TrainerClientStatus" AS ENUM ('PENDING', 'ACTIVE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "TrainerClient" (
    "id" TEXT NOT NULL,
    "status" "TrainerClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "inviteEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trainerId" TEXT NOT NULL,
    "clientId" TEXT,

    CONSTRAINT "TrainerClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanAssignment" (
    "id" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "planId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "PlanAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanAssignment_planId_clientId_key" ON "PlanAssignment"("planId", "clientId");

-- AddForeignKey
ALTER TABLE "TrainerClient" ADD CONSTRAINT "TrainerClient_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerClient" ADD CONSTRAINT "TrainerClient_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanAssignment" ADD CONSTRAINT "PlanAssignment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "TrainingPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanAssignment" ADD CONSTRAINT "PlanAssignment_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanAssignment" ADD CONSTRAINT "PlanAssignment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
