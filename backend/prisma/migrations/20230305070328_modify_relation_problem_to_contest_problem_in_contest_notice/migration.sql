-- DropForeignKey
ALTER TABLE "contest_notice" DROP CONSTRAINT "contest_notice_problem_id_fkey";

-- AddForeignKey
ALTER TABLE "contest_notice" ADD CONSTRAINT "contest_notice_problem_id_contest_id_fkey" FOREIGN KEY ("problem_id", "contest_id") REFERENCES "contest_problem"("contest_id", "problem_id") ON DELETE RESTRICT ON UPDATE CASCADE;
