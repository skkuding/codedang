-- CreateTable
CREATE TABLE "contest_problem_first_solver" (
    "contestProblemId" INTEGER NOT NULL,
    "contestRecordId" INTEGER NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contest_problem_first_solver_pkey" PRIMARY KEY ("contestProblemId")
);

-- AddForeignKey
ALTER TABLE "contest_problem_first_solver" ADD CONSTRAINT "contest_problem_first_solver_contestProblemId_fkey" FOREIGN KEY ("contestProblemId") REFERENCES "contest_problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_problem_first_solver" ADD CONSTRAINT "contest_problem_first_solver_contestRecordId_fkey" FOREIGN KEY ("contestRecordId") REFERENCES "contest_record"("id") ON DELETE CASCADE ON UPDATE CASCADE;
