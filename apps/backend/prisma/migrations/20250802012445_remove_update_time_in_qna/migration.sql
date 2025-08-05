/*
  Warnings:

  - You are about to drop the column `update_time` on the `contest_qna` table. All the data in the column will be lost.
  - You are about to drop the column `update_time` on the `contest_qna_comment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "contest_qna" DROP COLUMN "update_time";

-- AlterTable
ALTER TABLE "contest_qna_comment" DROP COLUMN "update_time";
