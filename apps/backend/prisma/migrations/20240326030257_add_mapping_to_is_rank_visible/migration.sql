/*
  Warnings:

  - You are about to drop the column `isRankVisible` on the `contest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "contest" DROP COLUMN "isRankVisible",
ADD COLUMN     "is_rank_visible" BOOLEAN NOT NULL DEFAULT true;
