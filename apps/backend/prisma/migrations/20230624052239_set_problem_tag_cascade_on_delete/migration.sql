-- DropForeignKey
ALTER TABLE "problem_tag" DROP CONSTRAINT "problem_tag_problem_id_fkey";

-- AddForeignKey
ALTER TABLE "problem_tag" ADD CONSTRAINT "problem_tag_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
