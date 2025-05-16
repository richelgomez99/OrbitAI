/*
  Warnings:

  - You are about to drop the column `mode` on the `Reflection` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Task` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "TaskStatus" ADD VALUE 'PENDING';

-- DropIndex
DROP INDEX "FocusSession_userId_startTime_idx";

-- DropIndex
DROP INDEX "Reflection_userId_createdAt_idx";

-- DropIndex
DROP INDEX "Task_userId_status_dueAt_idx";

-- AlterTable
ALTER TABLE "Reflection" DROP COLUMN "mode";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "tags",
ALTER COLUMN "completedAt" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "dueAt" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "timeSpentMinutes" DROP NOT NULL;

-- CreateTable
CREATE TABLE "GroundingStrategy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reflectionId" TEXT NOT NULL,
    "mode" "UserMode" NOT NULL,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroundingStrategy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GroundingStrategy_reflectionId_idx" ON "GroundingStrategy"("reflectionId");

-- CreateIndex
CREATE INDEX "FocusSession_userId_idx" ON "FocusSession"("userId");

-- CreateIndex
CREATE INDEX "Reflection_userId_idx" ON "Reflection"("userId");

-- CreateIndex
CREATE INDEX "Task_userId_status_idx" ON "Task"("userId", "status");

-- CreateIndex
CREATE INDEX "Task_userId_priority_idx" ON "Task"("userId", "priority");

-- CreateIndex
CREATE INDEX "Task_userId_dueAt_idx" ON "Task"("userId", "dueAt");

-- AddForeignKey
ALTER TABLE "GroundingStrategy" ADD CONSTRAINT "GroundingStrategy_reflectionId_fkey" FOREIGN KEY ("reflectionId") REFERENCES "Reflection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroundingStrategy" ADD CONSTRAINT "GroundingStrategy_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "FocusSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
