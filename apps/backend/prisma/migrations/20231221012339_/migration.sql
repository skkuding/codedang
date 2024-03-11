/*
  Warnings:

  - A unique constraint covering the columns `[contest_id,problem_id]` on the table `contest_problem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workbook_id,problem_id]` on the table `workbook_problem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "contest_problem_contest_id_order_key";

-- DropIndex
DROP INDEX "workbook_problem_workbook_id_order_key";

-- CreateIndex
CREATE UNIQUE INDEX "contest_problem_contest_id_problem_id_key" ON "contest_problem"("contest_id", "problem_id");

-- CreateIndex
CREATE UNIQUE INDEX "workbook_problem_workbook_id_problem_id_key" ON "workbook_problem"("workbook_id", "problem_id");
