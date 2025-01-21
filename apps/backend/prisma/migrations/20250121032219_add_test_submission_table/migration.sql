-- CreateTable
CREATE TABLE "test_submission" (
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

    CONSTRAINT "test_submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_submission_result" (
    "id" SERIAL NOT NULL,
    "test_submission_id" INTEGER NOT NULL,
    "is_user_test" BOOLEAN NOT NULL DEFAULT false,
    "problem_test_case_id" INTEGER,
    "user_testcase_id" INTEGER,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "result" "ResultStatus" NOT NULL,
    "cpu_time" BIGINT,
    "memory_usage" INTEGER,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_submission_result_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "test_submission" ADD CONSTRAINT "test_submission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_submission" ADD CONSTRAINT "test_submission_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_submission" ADD CONSTRAINT "test_submission_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_submission" ADD CONSTRAINT "test_submission_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_submission" ADD CONSTRAINT "test_submission_workbook_id_fkey" FOREIGN KEY ("workbook_id") REFERENCES "workbook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_submission_result" ADD CONSTRAINT "test_submission_result_test_submission_id_fkey" FOREIGN KEY ("test_submission_id") REFERENCES "test_submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_submission_result" ADD CONSTRAINT "test_submission_result_problem_test_case_id_fkey" FOREIGN KEY ("problem_test_case_id") REFERENCES "problem_testcase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
