/*
  Warnings:

  - You are about to drop the column `endedAt` on the `FocusSession` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `FocusSession` table. All the data in the column will be lost.
  - You are about to drop the column `challenge` on the `Reflection` table. All the data in the column will be lost.
  - You are about to drop the column `comment` on the `Reflection` table. All the data in the column will be lost.
  - You are about to drop the column `control` on the `Reflection` table. All the data in the column will be lost.
  - You are about to drop the column `win` on the `Reflection` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedTime` on the `Task` table. All the data in the column will be lost.
  - The `status` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `priority` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `mode` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `GroundingStrategy` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `FocusSession` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `mode` on the `FocusSession` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `mode` to the `Reflection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserMode" AS ENUM ('BUILD', 'FLOW', 'RESTORE');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- DropForeignKey
ALTER TABLE "GroundingStrategy" DROP CONSTRAINT "GroundingStrategy_reflectionId_fkey";

-- AlterTable
ALTER TABLE "FocusSession" DROP COLUMN "endedAt",
DROP COLUMN "startedAt",
ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "energyEnd" INTEGER,
ADD COLUMN     "energyStart" INTEGER,
ADD COLUMN     "focusScore" INTEGER,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "taskId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "mode",
ADD COLUMN     "mode" "UserMode" NOT NULL;

-- AlterTable
ALTER TABLE "Reflection" DROP COLUMN "challenge",
DROP COLUMN "comment",
DROP COLUMN "control",
DROP COLUMN "win",
ADD COLUMN     "challenges" TEXT,
ADD COLUMN     "controlRating" INTEGER,
ADD COLUMN     "journalEntry" TEXT,
ADD COLUMN     "mode" "UserMode" NOT NULL,
ADD COLUMN     "moodEmoji" TEXT,
ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "wins" TEXT;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "content",
DROP COLUMN "estimatedTime",
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "dueAt" TIMESTAMP(3),
ADD COLUMN     "estimatedMinutes" INTEGER,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "timeSpentMinutes" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "status",
ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
DROP COLUMN "priority",
ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
DROP COLUMN "mode",
ADD COLUMN     "mode" "UserMode" NOT NULL DEFAULT 'BUILD';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "defaultMode" "UserMode" NOT NULL DEFAULT 'BUILD',
ADD COLUMN     "lastActive" TIMESTAMP(3),
ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "GroundingStrategy";

-- CreateTable
CREATE TABLE "GroundingSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reflectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroundingSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModeTransition" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fromMode" "UserMode" NOT NULL,
    "toMode" "UserMode" NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "trigger" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModeTransition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mood" INTEGER,
    "energy" INTEGER,
    "focus" INTEGER,
    "stress" INTEGER,
    "currentMode" "UserMode",
    "currentTaskId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModeSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" "UserMode" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "energyStart" INTEGER,
    "energyEnd" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModeSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GroundingSource_reflectionId_idx" ON "GroundingSource"("reflectionId");

-- CreateIndex
CREATE INDEX "ModeTransition_userId_createdAt_idx" ON "ModeTransition"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UserState_userId_createdAt_idx" ON "UserState"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ModeSession_userId_startTime_idx" ON "ModeSession"("userId", "startTime");

-- CreateIndex
CREATE INDEX "FocusSession_userId_startTime_idx" ON "FocusSession"("userId", "startTime");

-- CreateIndex
CREATE INDEX "Reflection_userId_createdAt_idx" ON "Reflection"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Task_userId_status_dueAt_idx" ON "Task"("userId", "status", "dueAt");

-- AddForeignKey
ALTER TABLE "Reflection" ADD CONSTRAINT "Reflection_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "FocusSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroundingSource" ADD CONSTRAINT "GroundingSource_reflectionId_fkey" FOREIGN KEY ("reflectionId") REFERENCES "Reflection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusSession" ADD CONSTRAINT "FocusSession_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModeTransition" ADD CONSTRAINT "ModeTransition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserState" ADD CONSTRAINT "UserState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserState" ADD CONSTRAINT "UserState_currentTaskId_fkey" FOREIGN KEY ("currentTaskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModeSession" ADD CONSTRAINT "ModeSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
