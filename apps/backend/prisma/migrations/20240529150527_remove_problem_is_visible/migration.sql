/*
  Warnings:

  - You are about to drop the column `is_visible` on the `problem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "problem" DROP COLUMN "is_visible",
ALTER COLUMN "expose_time" DROP DEFAULT;
