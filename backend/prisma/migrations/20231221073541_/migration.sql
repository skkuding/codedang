-- DropForeignKey
ALTER TABLE "submssion_result" DROP CONSTRAINT "submssion_result_problem_test_case_id_fkey";

-- AddForeignKey
ALTER TABLE "submssion_result" ADD CONSTRAINT "submssion_result_problem_test_case_id_fkey" FOREIGN KEY ("problem_test_case_id") REFERENCES "problem_testcase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
