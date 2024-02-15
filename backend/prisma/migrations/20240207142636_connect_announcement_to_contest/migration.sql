/*
  Warnings:

  - Added the required column `contest_id` to the `announcement` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "announcement" DROP CONSTRAINT "announcement_problem_id_fkey";

-- AlterTable
ALTER TABLE "announcement" ADD COLUMN     "contest_id" INTEGER NOT NULL,
ALTER COLUMN "problem_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
