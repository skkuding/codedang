-- DropForeignKey
ALTER TABLE "submission" DROP CONSTRAINT "submission_contest_id_fkey";

-- DropForeignKey
ALTER TABLE "submission" DROP CONSTRAINT "submission_problem_id_fkey";

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
