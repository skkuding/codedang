-- DropForeignKey
ALTER TABLE "problem_testcase" DROP CONSTRAINT "problem_testcase_problem_id_fkey";

-- AddForeignKey
ALTER TABLE "problem_testcase" ADD CONSTRAINT "problem_testcase_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
