-- AlterTable
ALTER TABLE "contest_problem" ALTER COLUMN "score" SET DEFAULT 10;

-- AlterTable
ALTER TABLE "contest_record" ALTER COLUMN "penalty" DROP DEFAULT;
