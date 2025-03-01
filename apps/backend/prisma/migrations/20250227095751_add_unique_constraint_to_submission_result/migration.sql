/*
  Warnings:

  - A unique constraint covering the columns `[submission_id,problem_test_case_id]` on the table `submission_result` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "submission_result_submission_id_problem_test_case_id_key" ON "submission_result"("submission_id", "problem_test_case_id");
