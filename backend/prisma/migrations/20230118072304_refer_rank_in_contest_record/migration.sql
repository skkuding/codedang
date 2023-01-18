/*
  Warnings:

  - You are about to drop the column `rank` on the `contest_record` table. All the data in the column will be lost.
  - Added the required column `rankId` to the `contest_record` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contest_record" DROP COLUMN "rank",
ADD COLUMN     "rankId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "contest_record" ADD CONSTRAINT "contest_record_rankId_fkey" FOREIGN KEY ("rankId") REFERENCES "contest_rank_acm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
