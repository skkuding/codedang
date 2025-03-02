/*
  Warnings:

  - You are about to drop the column `invitation_code` on the `assignment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "assignment" DROP COLUMN "invitation_code";

-- CreateTable
CREATE TABLE "assignment_problem_record" (
    "assignmentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "problemId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "is_submitted" BOOLEAN NOT NULL DEFAULT false,
    "is_accepted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "assignment_problem_record_pkey" PRIMARY KEY ("assignmentId","userId","problemId")
);

-- AddForeignKey
ALTER TABLE "assignment_problem_record" ADD CONSTRAINT "assignment_problem_record_assignmentId_problemId_fkey" FOREIGN KEY ("assignmentId", "problemId") REFERENCES "assignment_problem"("assignment_id", "problem_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_problem_record" ADD CONSTRAINT "assignment_problem_record_assignmentId_userId_fkey" FOREIGN KEY ("assignmentId", "userId") REFERENCES "assignment_record"("assignment_id", "user_id") ON DELETE CASCADE ON UPDATE CASCADE;
