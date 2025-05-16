/*
  Warnings:

  - You are about to drop the column `journal` on the `Reflection` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Reflection` table. All the data in the column will be lost.
  - You are about to drop the column `mode` on the `Reflection` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Reflection` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Reflection_createdAt_idx";

-- DropIndex
DROP INDEX "Reflection_userId_idx";

-- AlterTable
ALTER TABLE "Reflection" DROP COLUMN "journal",
DROP COLUMN "metadata",
DROP COLUMN "mode",
DROP COLUMN "tags",
ADD COLUMN     "clarityGained" BOOLEAN,
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "control" INTEGER,
ADD COLUMN     "emotionLabel" TEXT,
ALTER COLUMN "win" DROP NOT NULL;

-- CreateTable
CREATE TABLE "GroundingStrategy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reflectionId" TEXT NOT NULL,

    CONSTRAINT "GroundingStrategy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroundingStrategy_reflectionId_name_key" ON "GroundingStrategy"("reflectionId", "name");

-- AddForeignKey
ALTER TABLE "GroundingStrategy" ADD CONSTRAINT "GroundingStrategy_reflectionId_fkey" FOREIGN KEY ("reflectionId") REFERENCES "Reflection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
