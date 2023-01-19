/*
  Warnings:

  - Changed the type of `problem_id` on the `contest_notice` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "contest_notice" DROP COLUMN "problem_id",
ADD COLUMN     "problem_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "contest_notice" ADD CONSTRAINT "contest_notice_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
