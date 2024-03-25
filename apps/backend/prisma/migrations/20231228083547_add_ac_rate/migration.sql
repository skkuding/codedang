-- AlterTable
ALTER TABLE "problem" ADD COLUMN     "accepted_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "accepted_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "submission_count" INTEGER NOT NULL DEFAULT 0;
