/*
  Warnings:

  - The values [Viewer] on the enum `CollaboratorRole` will be removed. If these variants are still used in the database, this will fail.
  - The values [Active] on the enum `CollaboratorStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `mandeuldang_approval_request` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mandeuldang_problem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mandeuldang_sample` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ProblemCreationMode" AS ENUM ('Legacy', 'Mandeuldang');

-- CreateEnum
CREATE TYPE "public"."ProblemStatus" AS ENUM ('Draft', 'Ready', 'Published');

-- CreateEnum
CREATE TYPE "public"."ProblemType" AS ENUM ('General', 'SpecialJudge');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."CollaboratorRole_new" AS ENUM ('Owner', 'Editor', 'Reviewer');
ALTER TABLE "public"."mandeuldang_collaborator" ALTER COLUMN "role" TYPE "public"."CollaboratorRole_new" USING ("role"::text::"public"."CollaboratorRole_new");
ALTER TYPE "public"."CollaboratorRole" RENAME TO "CollaboratorRole_old";
ALTER TYPE "public"."CollaboratorRole_new" RENAME TO "CollaboratorRole";
DROP TYPE "public"."CollaboratorRole_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."CollaboratorStatus_new" AS ENUM ('Pending', 'Approved');
ALTER TABLE "public"."mandeuldang_collaborator" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."mandeuldang_collaborator" ALTER COLUMN "status" TYPE "public"."CollaboratorStatus_new" USING ("status"::text::"public"."CollaboratorStatus_new");
ALTER TYPE "public"."CollaboratorStatus" RENAME TO "CollaboratorStatus_old";
ALTER TYPE "public"."CollaboratorStatus_new" RENAME TO "CollaboratorStatus";
DROP TYPE "public"."CollaboratorStatus_old";
ALTER TABLE "public"."mandeuldang_collaborator" ALTER COLUMN "status" SET DEFAULT 'Pending';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."mandeuldang_approval_request" DROP CONSTRAINT "mandeuldang_approval_request_problem_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."mandeuldang_approval_request" DROP CONSTRAINT "mandeuldang_approval_request_requester_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."mandeuldang_approval_request" DROP CONSTRAINT "mandeuldang_approval_request_reviewer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."mandeuldang_collaborator" DROP CONSTRAINT "mandeuldang_collaborator_problem_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."mandeuldang_problem" DROP CONSTRAINT "mandeuldang_problem_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."mandeuldang_run_request" DROP CONSTRAINT "mandeuldang_run_request_problem_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."mandeuldang_sample" DROP CONSTRAINT "mandeuldang_sample_problem_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."mandeuldang_solution" DROP CONSTRAINT "mandeuldang_solution_problem_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."mandeuldang_test_file" DROP CONSTRAINT "mandeuldang_test_file_problem_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."mandeuldang_tool" DROP CONSTRAINT "mandeuldang_tool_problem_id_fkey";

-- AlterTable
ALTER TABLE "public"."problem" ADD COLUMN     "creation_mode" "public"."ProblemCreationMode" NOT NULL DEFAULT 'Legacy',
ADD COLUMN     "last_run_pass" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "problem_type" "public"."ProblemType" NOT NULL DEFAULT 'General',
ADD COLUMN     "status" "public"."ProblemStatus" NOT NULL DEFAULT 'Published',
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "input_description" DROP NOT NULL,
ALTER COLUMN "output_description" DROP NOT NULL,
ALTER COLUMN "hint" DROP NOT NULL,
ALTER COLUMN "time_limit" DROP NOT NULL,
ALTER COLUMN "memory_limit" DROP NOT NULL,
ALTER COLUMN "source" DROP NOT NULL,
ALTER COLUMN "languages" SET DEFAULT ARRAY[]::"public"."Language"[],
ALTER COLUMN "difficulty" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."mandeuldang_approval_request";

-- DropTable
DROP TABLE "public"."mandeuldang_problem";

-- DropTable
DROP TABLE "public"."mandeuldang_sample";

-- DropEnum
DROP TYPE "public"."MandeuldangApprovalStatus";

-- DropEnum
DROP TYPE "public"."MandeuldangProblemStatus";

-- CreateIndex
CREATE INDEX "problem_created_by_id_creation_mode_status_idx" ON "public"."problem"("created_by_id", "creation_mode", "status");

-- AddForeignKey
ALTER TABLE "public"."mandeuldang_test_file" ADD CONSTRAINT "mandeuldang_test_file_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mandeuldang_solution" ADD CONSTRAINT "mandeuldang_solution_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mandeuldang_tool" ADD CONSTRAINT "mandeuldang_tool_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mandeuldang_collaborator" ADD CONSTRAINT "mandeuldang_collaborator_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mandeuldang_run_request" ADD CONSTRAINT "mandeuldang_run_request_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
