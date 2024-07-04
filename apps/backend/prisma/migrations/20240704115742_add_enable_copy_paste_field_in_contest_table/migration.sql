/*
  Warnings:

  - Added the required column `enable_copy_paste` to the `contest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contest" ADD COLUMN     "enable_copy_paste" BOOLEAN NOT NULL;
