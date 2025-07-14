-- AlterTable
ALTER TABLE "problem_testcase" ADD COLUMN     "accepted_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "submission_count" INTEGER NOT NULL DEFAULT 0;
