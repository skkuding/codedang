/*
  Warnings:

  - Made the column `problem_test_case_id` on table `submission_result` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "submission_result" ALTER COLUMN "problem_test_case_id" SET NOT NULL;
