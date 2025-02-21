/*
  Warnings:

  - You are about to drop the column `contest_id` on the `announcement` table. All the data in the column will be lost.
  - You are about to drop the column `contest_id` on the `submission` table. All the data in the column will be lost.
  - You are about to drop the `contest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contest_problem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contest_record` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `assignment_id` to the `announcement` table without a default value. This is not possible if the table is not empty.

*/

--RENAME TABLE (Contest)
ALTER TABLE contest RENAME TO assignment;

--RENAME COLUMN
ALTER TABLE contest_record RENAME COLUMN contest_id to assignment_id;

--RENAME COLUMN
ALTER TABLE contest_problem RENAME COLUMN contest_id to assignment_id;

--RENAME COLUMN
ALTER TABLE announcement RENAME COLUMN contest_id to assignment_id;

--RENAME COLUMN
ALTER TABLE submission RENAME COLUMN contest_id to assignment_id;

-- RenamePrimaryKey
ALTER TABLE "assignment" RENAME CONSTRAINT "contest_pkey" TO "assignment_pkey";

-- RenameForeignKey
ALTER TABLE "assignment" RENAME CONSTRAINT "contest_group_id_fkey" TO "assignment_group_id_fkey";

-- RenameForeignKey
ALTER TABLE "assignment" RENAME CONSTRAINT "contest_created_by_id_fkey" TO "assignment_create_by_id_fkey";

-- RenameForeignKey
ALTER TABLE "assignment" RENAME CONSTRAINT "assignment_create_by_id_fkey" TO "assignment_created_by_id_fkey";

-- RenameForeignKey
ALTER TABLE "announcement" RENAME CONSTRAINT "announcement_contest_id_fkey" TO "announcement_assignment_id_fkey";

-- RenameForeignKey
ALTER TABLE "submission" RENAME CONSTRAINT "submission_contest_id_fkey" TO "submission_assignment_id_fkey";

-- RenameForeignKey
ALTER TABLE "contest_problem" RENAME CONSTRAINT "contest_problem_contest_id_fkey" TO "contest_problem_assignment_id_fkey";

-- RenameForeignKey
ALTER TABLE "contest_record" RENAME CONSTRAINT "contest_record_contest_id_fkey" TO "contest_record_assignment_id_fkey";

--RENAME TABLE (ContestProblem)
ALTER TABLE contest_problem RENAME TO assignment_problem;

-- RenamePrimaryKey
ALTER TABLE "assignment_problem" RENAME CONSTRAINT "contest_problem_pkey" TO "assignment_problem_pkey";

-- RenameForeignKey
ALTER TABLE "assignment_problem" RENAME CONSTRAINT "contest_problem_assignment_id_fkey" TO "assignment_problem_assignment_id_fkey";

-- RenameForeignKey
ALTER TABLE "assignment_problem" RENAME CONSTRAINT "contest_problem_problem_id_fkey" TO "assignment_problem_problem_id_fkey";

--RENAME TABLE (AssignmentRecord)
ALTER TABLE contest_record RENAME TO assignment_record;

-- RenamePrimaryKey
ALTER TABLE "assignment_record" RENAME CONSTRAINT "contest_record_pkey" TO "assignment_record_pkey";

-- RenameForeignKey
ALTER TABLE "assignment_record" RENAME CONSTRAINT "contest_record_user_id_fkey" TO "assignment_record_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "assignment_record" RENAME CONSTRAINT "contest_record_assignment_id_fkey" TO "assignment_record_assignment_id_fkey";

-- RenameIndex
ALTER INDEX "contest_record_contest_id_user_id_key" RENAME TO "assignment_record_assignment_id_user_id_key";
