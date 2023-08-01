-- DropForeignKey
ALTER TABLE "problem_tag" DROP CONSTRAINT "problem_tag_problem_id_fkey";

-- DropForeignKey
ALTER TABLE "problem_tag" DROP CONSTRAINT "problem_tag_tag_id_fkey";

-- AddForeignKey
ALTER TABLE "problem_tag" ADD CONSTRAINT "problem_tag_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "problem_tag" ADD CONSTRAINT "problem_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
