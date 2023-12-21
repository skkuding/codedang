-- DropForeignKey
ALTER TABLE "contest" DROP CONSTRAINT "contest_group_id_fkey";

-- DropForeignKey
ALTER TABLE "contest_problem" DROP CONSTRAINT "contest_problem_contest_id_fkey";

-- DropForeignKey
ALTER TABLE "contest_problem" DROP CONSTRAINT "contest_problem_problem_id_fkey";

-- DropForeignKey
ALTER TABLE "contest_record" DROP CONSTRAINT "contest_record_contest_id_fkey";

-- DropForeignKey
ALTER TABLE "notice" DROP CONSTRAINT "notice_group_id_fkey";

-- DropForeignKey
ALTER TABLE "problem" DROP CONSTRAINT "problem_group_id_fkey";

-- DropForeignKey
ALTER TABLE "submission" DROP CONSTRAINT "submission_problem_id_fkey";

-- DropForeignKey
ALTER TABLE "submssion_result" DROP CONSTRAINT "submssion_result_problem_test_case_id_fkey";

-- DropForeignKey
ALTER TABLE "submssion_result" DROP CONSTRAINT "submssion_result_submission_id_fkey";

-- DropForeignKey
ALTER TABLE "user_group" DROP CONSTRAINT "user_group_group_id_fkey";

-- DropForeignKey
ALTER TABLE "workbook" DROP CONSTRAINT "workbook_group_id_fkey";

-- DropForeignKey
ALTER TABLE "workbook_problem" DROP CONSTRAINT "workbook_problem_problem_id_fkey";

-- DropForeignKey
ALTER TABLE "workbook_problem" DROP CONSTRAINT "workbook_problem_workbook_id_fkey";

-- AddForeignKey
ALTER TABLE "user_group" ADD CONSTRAINT "user_group_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notice" ADD CONSTRAINT "notice_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem" ADD CONSTRAINT "problem_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest" ADD CONSTRAINT "contest_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_problem" ADD CONSTRAINT "contest_problem_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_problem" ADD CONSTRAINT "contest_problem_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_record" ADD CONSTRAINT "contest_record_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workbook" ADD CONSTRAINT "workbook_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workbook_problem" ADD CONSTRAINT "workbook_problem_workbook_id_fkey" FOREIGN KEY ("workbook_id") REFERENCES "workbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workbook_problem" ADD CONSTRAINT "workbook_problem_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submssion_result" ADD CONSTRAINT "submssion_result_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submssion_result" ADD CONSTRAINT "submssion_result_problem_test_case_id_fkey" FOREIGN KEY ("problem_test_case_id") REFERENCES "problem_testcase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
