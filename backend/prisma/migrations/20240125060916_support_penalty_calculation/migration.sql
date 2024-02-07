/*
  Warnings:

  - You are about to drop the column `accepted_problem_num` on the `contest_record` table. All the data in the column will be lost.
  - You are about to drop the column `total_penalty` on the `contest_record` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "contest_record" DROP COLUMN "accepted_problem_num",
DROP COLUMN "total_penalty",
ADD COLUMN     "last_accepted" TIMESTAMP(3),
ADD COLUMN     "penalty" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "unaccepted" INTEGER NOT NULL DEFAULT 0;
