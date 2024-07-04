/*
  Warnings:

  - Added the required column `enable_copy_paste` to the `contest_problem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contest_problem" ADD COLUMN     "enable_copy_paste" BOOLEAN NOT NULL;
