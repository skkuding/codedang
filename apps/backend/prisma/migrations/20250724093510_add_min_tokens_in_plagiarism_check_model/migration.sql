/*
  Warnings:

  - Added the required column `min_tokens` to the `plagiarism_check` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "plagiarism_check" ADD COLUMN     "min_tokens" INTEGER NOT NULL;
