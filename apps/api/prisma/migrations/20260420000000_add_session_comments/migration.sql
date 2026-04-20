-- CreateTable
CREATE TABLE "SessionComment" (
    "id"        TEXT NOT NULL,
    "text"      TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,

    CONSTRAINT "SessionComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SessionComment" ADD CONSTRAINT "SessionComment_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "WorkoutSession"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionComment" ADD CONSTRAINT "SessionComment_trainerId_fkey"
    FOREIGN KEY ("trainerId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
