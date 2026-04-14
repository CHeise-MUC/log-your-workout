-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- AlterTable
ALTER TABLE "TrainingPlan" ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE';
