/*
  Warnings:

  - You are about to alter the column `score` on the `assignment_problem_record` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `score` on the `assignment_record` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "public"."assignment_problem_record" ALTER COLUMN "score" SET DEFAULT 0,
ALTER COLUMN "score" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "public"."assignment_record" ALTER COLUMN "score" SET DEFAULT 0,
ALTER COLUMN "score" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "public"."submission" ALTER COLUMN "score" SET DEFAULT 0,
ALTER COLUMN "score" SET DATA TYPE DECIMAL(20,10);
