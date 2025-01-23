-- CreateTable
CREATE TABLE "ContestSolveHistory" (
    "record_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "contest_problem_id" INTEGER NOT NULL,
    "max_score" INTEGER NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,
    "contestRecordId" INTEGER,

    CONSTRAINT "ContestSolveHistory_pkey" PRIMARY KEY ("record_id","user_id","contest_problem_id")
);

-- AddForeignKey
ALTER TABLE "ContestSolveHistory" ADD CONSTRAINT "ContestSolveHistory_contestRecordId_fkey" FOREIGN KEY ("contestRecordId") REFERENCES "contest_record"("id") ON DELETE SET NULL ON UPDATE CASCADE;
