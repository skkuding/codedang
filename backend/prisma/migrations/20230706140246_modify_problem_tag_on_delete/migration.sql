-- DropForeignKey
ALTER TABLE "problem_tag" DROP CONSTRAINT "problem_tag_tag_id_fkey";

-- AddForeignKey
ALTER TABLE "problem_tag" ADD CONSTRAINT "problem_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
