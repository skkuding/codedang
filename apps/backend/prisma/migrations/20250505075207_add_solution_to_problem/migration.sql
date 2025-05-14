-- AlterTable
ALTER TABLE "problem" ADD COLUMN     "solution" JSONB[] DEFAULT ARRAY[]::JSONB[];
