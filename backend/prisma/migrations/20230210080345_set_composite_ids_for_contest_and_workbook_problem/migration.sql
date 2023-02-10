/*
  Warnings:

  - The primary key for the `contest_problem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `workbook_problem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[contest_id,id]` on the table `contest_problem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workbook_id,id]` on the table `workbook_problem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "contest_problem" DROP CONSTRAINT "contest_problem_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "contest_problem_pkey" PRIMARY KEY ("contest_id", "problem_id");
DROP SEQUENCE "contest_problem_id_seq";

-- AlterTable
ALTER TABLE "workbook_problem" DROP CONSTRAINT "workbook_problem_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "workbook_problem_pkey" PRIMARY KEY ("workbook_id", "problem_id");
DROP SEQUENCE "workbook_problem_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "contest_problem_contest_id_id_key" ON "contest_problem"("contest_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "workbook_problem_workbook_id_id_key" ON "workbook_problem"("workbook_id", "id");
