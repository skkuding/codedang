-- DropForeignKey
ALTER TABLE "user_problem" DROP CONSTRAINT "user_problem_problem_id_fkey";

-- DropForeignKey
ALTER TABLE "user_problem" DROP CONSTRAINT "user_problem_user_id_fkey";

-- AddForeignKey
ALTER TABLE "user_problem" ADD CONSTRAINT "user_problem_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_problem" ADD CONSTRAINT "user_problem_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
