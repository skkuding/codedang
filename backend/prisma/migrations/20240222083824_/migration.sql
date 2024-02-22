/*
  Warnings:

  - You are about to drop the column `isVisible` on the `contest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "contest" DROP COLUMN "isVisible",
ADD COLUMN     "is_visible" BOOLEAN NOT NULL DEFAULT true;
