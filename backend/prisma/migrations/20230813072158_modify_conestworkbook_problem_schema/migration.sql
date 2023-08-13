/*
  Warnings:

  - You are about to drop the column `id` on the `contest_problem` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `workbook_problem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contest_id,order]` on the table `contest_problem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workbook_id,order]` on the table `workbook_problem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order` to the `contest_problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `workbook_problem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "contest_problem_contest_id_id_key";

-- DropIndex
DROP INDEX "workbook_problem_workbook_id_id_key";

-- AlterTable
ALTER TABLE "contest_problem" DROP COLUMN "id",
ADD COLUMN     "order" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "workbook_problem" DROP COLUMN "id",
ADD COLUMN     "order" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "contest_problem_contest_id_order_key" ON "contest_problem"("contest_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "workbook_problem_workbook_id_order_key" ON "workbook_problem"("workbook_id", "order");
