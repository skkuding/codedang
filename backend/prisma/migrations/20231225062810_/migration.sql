-- AlterTable
-- prisma migrate 시 에러가 나서 직접 migration.sql 파일을 수정함
-- ALTER TABLE "contest_notice" ADD COLUMN     "userProblemContestId" INTEGER,
-- ADD COLUMN     "userProblemProblemId" INTEGER;

-- CreateTable
CREATE TABLE "user_problem" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "template" JSONB[],
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_problem_pkey" PRIMARY KEY ("user_id","problem_id")
);

-- AddForeignKey
ALTER TABLE "user_problem" ADD CONSTRAINT "user_problem_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_problem" ADD CONSTRAINT "user_problem_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
