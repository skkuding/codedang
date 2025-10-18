/*
  Warnings:

  - Made the column `score_weight` on table `problem_testcase` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."problem_testcase" ALTER COLUMN "score_weight" SET NOT NULL;
