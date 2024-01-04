/*
  Warnings:

  - You are about to drop the `submssion_result` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE submssion_result RENAME TO submission_result;

-- AlterTable
ALTER TABLE "submission_result" RENAME CONSTRAINT "submssion_result_pkey" TO "submission_result_pkey";

-- RenameForeignKey
ALTER TABLE "submission_result" RENAME CONSTRAINT "submssion_result_problem_test_case_id_fkey" TO "submission_result_problem_test_case_id_fkey";

-- RenameForeignKey
ALTER TABLE "submission_result" RENAME CONSTRAINT "submssion_result_submission_id_fkey" TO "submission_result_submission_id_fkey";
