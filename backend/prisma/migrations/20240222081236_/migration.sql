/*
  Warnings:

  - You are about to drop the column `config` on the `contest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "contest" DROP COLUMN "config",
ADD COLUMN     "isRankVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true;
