/*
  Warnings:

  - You are about to drop the column `expose_time` on the `problem` table. All the data in the column will be lost.
  - You are about to drop the column `is_visible` on the `problem` table. All the data in the column will be lost.
  - Added the required column `visible_lock_time` to the `problem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "problem" DROP COLUMN "is_visible";
ALTER TABLE "problem" RENAME COLUMN "expose_time" TO "visible_lock_time";
ALTER TABLE "problem" ALTER COLUMN "visible_lock_time" DROP DEFAULT;
