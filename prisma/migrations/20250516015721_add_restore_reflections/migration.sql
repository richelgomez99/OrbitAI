/*
  Warnings:

  - You are about to drop the column `comment` on the `Reflection` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Reflection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `win` to the `Reflection` table without a default value. This is not possible if the table is not empty.
  - Made the column `priority` on table `Task` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Reflection" DROP COLUMN "comment",
ADD COLUMN     "challenge" TEXT,
ADD COLUMN     "cognitiveLoad" INTEGER,
ADD COLUMN     "journal" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "mode" TEXT NOT NULL DEFAULT 'restore',
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "win" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "status" SET DEFAULT 'TODO',
ALTER COLUMN "priority" SET NOT NULL,
ALTER COLUMN "priority" SET DEFAULT 'MEDIUM';

-- CreateIndex
CREATE INDEX "Reflection_userId_idx" ON "Reflection"("userId");

-- CreateIndex
CREATE INDEX "Reflection_createdAt_idx" ON "Reflection"("createdAt");
