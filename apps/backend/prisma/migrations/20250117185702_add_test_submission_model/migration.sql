-- CreateTable
CREATE TABLE "testcase_submission" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "user_ip" TEXT,
    "problem_id" INTEGER NOT NULL,
    "assignment_id" INTEGER,
    "contest_id" INTEGER,
    "workbook_id" INTEGER,
    "language" "Language" NOT NULL,
    "code" JSONB[],
    "code_size" INTEGER,
    "is_user_test" BOOLEAN NOT NULL DEFAULT false,
    "result" "ResultStatus" NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testcase_submission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "testcase_submission" ADD CONSTRAINT "testcase_submission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testcase_submission" ADD CONSTRAINT "testcase_submission_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testcase_submission" ADD CONSTRAINT "testcase_submission_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testcase_submission" ADD CONSTRAINT "testcase_submission_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testcase_submission" ADD CONSTRAINT "testcase_submission_workbook_id_fkey" FOREIGN KEY ("workbook_id") REFERENCES "workbook"("id") ON DELETE SET NULL ON UPDATE CASCADE;
