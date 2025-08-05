/*
  Warnings:

  - You are about to drop the column `check_id` on the `plagiarism_check` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "plagiarism_check_check_id_key";

-- AlterTable
ALTER TABLE "plagiarism_check" DROP COLUMN "check_id";
