/*
  Warnings:

  - A unique constraint covering the columns `[display_id]` on the table `contest_problem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contest_id,problem_id]` on the table `contest_problem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[group_id,problem_id]` on the table `group_problem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[display_id]` on the table `workbook_problem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workbook_id,problem_id]` on the table `workbook_problem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `display_id` to the `contest_problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `update_time` to the `group_problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `display_id` to the `workbook_problem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contest_problem" ADD COLUMN     "display_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "group_problem" ADD COLUMN     "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "update_time" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "workbook_problem" ADD COLUMN     "display_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "contest_problem_display_id_key" ON "contest_problem"("display_id");

-- CreateIndex
CREATE UNIQUE INDEX "contest_problem_contest_id_problem_id_key" ON "contest_problem"("contest_id", "problem_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_problem_group_id_problem_id_key" ON "group_problem"("group_id", "problem_id");

-- CreateIndex
CREATE UNIQUE INDEX "workbook_problem_display_id_key" ON "workbook_problem"("display_id");

-- CreateIndex
CREATE UNIQUE INDEX "workbook_problem_workbook_id_problem_id_key" ON "workbook_problem"("workbook_id", "problem_id");
