/*
  Warnings:

  - You are about to drop the column `is_rank_visible` on the `contest` table. All the data in the column will be lost.
  - You are about to drop the column `is_visible` on the `contest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "contest" DROP COLUMN "is_rank_visible",
DROP COLUMN "is_visible";
