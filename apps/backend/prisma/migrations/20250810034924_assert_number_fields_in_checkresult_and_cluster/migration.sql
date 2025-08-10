/*
  Warnings:

  - Made the column `average_similarity` on table `check_result` required. This step will fail if there are existing NULL values in that column.
  - Made the column `max_similarity` on table `check_result` required. This step will fail if there are existing NULL values in that column.
  - Made the column `max_length` on table `check_result` required. This step will fail if there are existing NULL values in that column.
  - Made the column `longest_match` on table `check_result` required. This step will fail if there are existing NULL values in that column.
  - Made the column `first_similarity` on table `check_result` required. This step will fail if there are existing NULL values in that column.
  - Made the column `second_similarity` on table `check_result` required. This step will fail if there are existing NULL values in that column.
  - Made the column `average_similarity` on table `plagiarism_cluster` required. This step will fail if there are existing NULL values in that column.
  - Made the column `second_user_id` on table `plagiarism_cluster` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."check_result" ALTER COLUMN "average_similarity" SET NOT NULL,
ALTER COLUMN "max_similarity" SET NOT NULL,
ALTER COLUMN "max_length" SET NOT NULL,
ALTER COLUMN "longest_match" SET NOT NULL,
ALTER COLUMN "first_similarity" SET NOT NULL,
ALTER COLUMN "second_similarity" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."plagiarism_cluster" ALTER COLUMN "average_similarity" SET NOT NULL,
ALTER COLUMN "second_user_id" SET NOT NULL;
