/*
  Warnings:

  - You are about to drop the column `score_weight` on the `problem_testcase` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "problem_testcase" DROP COLUMN "score_weight",
ADD COLUMN     "score_weight_denominator" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "score_weight_numerator" INTEGER NOT NULL DEFAULT 1;
