-- CreateEnum
CREATE TYPE "QnACategory" AS ENUM ('General', 'Problem');

-- AlterTable
ALTER TABLE "contest_qna" ADD COLUMN     "category" "QnACategory" NOT NULL DEFAULT 'General',
ADD COLUMN     "problem_id" INTEGER;

-- AddForeignKey
ALTER TABLE "contest_qna" ADD CONSTRAINT "contest_qna_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
