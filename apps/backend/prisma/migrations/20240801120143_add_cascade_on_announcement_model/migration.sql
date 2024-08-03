-- DropForeignKey
ALTER TABLE "announcement" DROP CONSTRAINT "announcement_contest_id_fkey";

-- DropForeignKey
ALTER TABLE "announcement" DROP CONSTRAINT "announcement_problem_id_fkey";

-- AddForeignKey
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
