-- AlterTable
ALTER TABLE "contest" ADD COLUMN     "freeze_time" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "contest_problem_record" ADD COLUMN     "final_score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "final_submit_count_penalty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "final_time_penalty" INTEGER NOT NULL DEFAULT 0;
