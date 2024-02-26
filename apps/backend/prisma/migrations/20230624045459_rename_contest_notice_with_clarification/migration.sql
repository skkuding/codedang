/*
  Warnings:

  - You are about to drop the column `description` on the `contest_notice` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `contest_notice` table. All the data in the column will be lost.
  - Added the required column `content` to the `contest_notice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "contest_notice" DROP CONSTRAINT "contest_notice_contest_id_fkey";

-- DropForeignKey
ALTER TABLE "contest_notice" DROP CONSTRAINT "contest_notice_problem_id_fkey";

-- AlterTable
ALTER TABLE "contest_notice" DROP COLUMN "description",
DROP COLUMN "title",
ADD COLUMN     "content" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "contest_notice" ADD CONSTRAINT "contest_notice_contest_id_problem_id_fkey" FOREIGN KEY ("contest_id", "problem_id") REFERENCES "contest_problem"("contest_id", "problem_id") ON DELETE CASCADE ON UPDATE CASCADE;
