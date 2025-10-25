/*
  Warnings:

  - You are about to alter the column `final_score` on the `assignment_problem_record` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `final_score` on the `assignment_record` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "public"."assignment_problem_record" ALTER COLUMN "final_score" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "public"."assignment_record" ALTER COLUMN "final_score" SET DATA TYPE DECIMAL(10,2);
