-- AlterTable
ALTER TABLE "FocusSession" ADD COLUMN     "interruptions" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
