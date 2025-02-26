-- AlterTable
ALTER TABLE "assignment" ADD COLUMN     "auto_finalize_score" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_final_score_visible" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "assignment_problem_record" ADD COLUMN     "comment" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "final_score" INTEGER;

-- AlterTable
ALTER TABLE "assignment_record" ADD COLUMN     "comment" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "final_score" INTEGER;
