-- CreateTable
CREATE TABLE "testcase_submission_result" (
    "id" SERIAL NOT NULL,
    "testcase_submission_id" INTEGER NOT NULL,
    "is_user_test" BOOLEAN NOT NULL DEFAULT false,
    "problem_test_case_id" INTEGER,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "result" "ResultStatus" NOT NULL,
    "cpu_time" BIGINT,
    "memory_usage" INTEGER,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testcase_submission_result_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "testcase_submission_result" ADD CONSTRAINT "testcase_submission_result_testcase_submission_id_fkey" FOREIGN KEY ("testcase_submission_id") REFERENCES "testcase_submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testcase_submission_result" ADD CONSTRAINT "testcase_submission_result_problem_test_case_id_fkey" FOREIGN KEY ("problem_test_case_id") REFERENCES "problem_testcase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
