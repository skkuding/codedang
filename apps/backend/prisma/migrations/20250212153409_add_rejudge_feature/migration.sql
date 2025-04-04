/*
  Warnings:

  - You are about to drop the `test_submission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "test_submission" DROP CONSTRAINT "test_submission_assignment_id_fkey";

-- DropForeignKey
ALTER TABLE "test_submission" DROP CONSTRAINT "test_submission_contest_id_fkey";

-- DropForeignKey
ALTER TABLE "test_submission" DROP CONSTRAINT "test_submission_problem_id_fkey";

-- DropForeignKey
ALTER TABLE "test_submission" DROP CONSTRAINT "test_submission_user_id_fkey";

-- DropForeignKey
ALTER TABLE "test_submission" DROP CONSTRAINT "test_submission_workbook_id_fkey";

-- AlterTable
ALTER TABLE "submission" ADD COLUMN     "isRejudged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rejudged_from_id" INTEGER;

-- DropTable
DROP TABLE "test_submission";

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_rejudged_from_id_fkey" FOREIGN KEY ("rejudged_from_id") REFERENCES "submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
