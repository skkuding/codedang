-- RenameEnum
ALTER TYPE "public"."PolygonProblemStatus" RENAME TO "MandeuldangProblemStatus";
ALTER TYPE "public"."PolygonApprovalStatus" RENAME TO "MandeuldangApprovalStatus";

-- CreateEnum (신규 — 기존 대응 타입 없음)
CREATE TYPE "public"."MandeuldangRunStatus" AS ENUM ('Pending', 'Running', 'Success', 'Failed');

-- RenameTable
ALTER TABLE "public"."polygon_problem" RENAME TO "mandeuldang_problem";
ALTER TABLE "public"."polygon_sample" RENAME TO "mandeuldang_sample";
ALTER TABLE "public"."polygon_test_file" RENAME TO "mandeuldang_test_file";
ALTER TABLE "public"."polygon_solution" RENAME TO "mandeuldang_solution";
ALTER TABLE "public"."polygon_tool" RENAME TO "mandeuldang_tool";
ALTER TABLE "public"."polygon_collaborator" RENAME TO "mandeuldang_collaborator";
ALTER TABLE "public"."polygon_approval_request" RENAME TO "mandeuldang_approval_request";

-- RenameConstraint (Primary Keys)
ALTER TABLE "public"."mandeuldang_problem" RENAME CONSTRAINT "polygon_problem_pkey" TO "mandeuldang_problem_pkey";
ALTER TABLE "public"."mandeuldang_sample" RENAME CONSTRAINT "polygon_sample_pkey" TO "mandeuldang_sample_pkey";
ALTER TABLE "public"."mandeuldang_test_file" RENAME CONSTRAINT "polygon_test_file_pkey" TO "mandeuldang_test_file_pkey";
ALTER TABLE "public"."mandeuldang_solution" RENAME CONSTRAINT "polygon_solution_pkey" TO "mandeuldang_solution_pkey";
ALTER TABLE "public"."mandeuldang_tool" RENAME CONSTRAINT "polygon_tool_pkey" TO "mandeuldang_tool_pkey";
ALTER TABLE "public"."mandeuldang_collaborator" RENAME CONSTRAINT "polygon_collaborator_pkey" TO "mandeuldang_collaborator_pkey";
ALTER TABLE "public"."mandeuldang_approval_request" RENAME CONSTRAINT "polygon_approval_request_pkey" TO "mandeuldang_approval_request_pkey";

-- RenameConstraint (Foreign Keys)
ALTER TABLE "public"."mandeuldang_problem" RENAME CONSTRAINT "polygon_problem_created_by_id_fkey" TO "mandeuldang_problem_created_by_id_fkey";
ALTER TABLE "public"."mandeuldang_sample" RENAME CONSTRAINT "polygon_sample_problem_id_fkey" TO "mandeuldang_sample_problem_id_fkey";
ALTER TABLE "public"."mandeuldang_test_file" RENAME CONSTRAINT "polygon_test_file_problem_id_fkey" TO "mandeuldang_test_file_problem_id_fkey";
ALTER TABLE "public"."mandeuldang_solution" RENAME CONSTRAINT "polygon_solution_problem_id_fkey" TO "mandeuldang_solution_problem_id_fkey";
ALTER TABLE "public"."mandeuldang_tool" RENAME CONSTRAINT "polygon_tool_problem_id_fkey" TO "mandeuldang_tool_problem_id_fkey";
ALTER TABLE "public"."mandeuldang_collaborator" RENAME CONSTRAINT "polygon_collaborator_problem_id_fkey" TO "mandeuldang_collaborator_problem_id_fkey";
ALTER TABLE "public"."mandeuldang_collaborator" RENAME CONSTRAINT "polygon_collaborator_user_id_fkey" TO "mandeuldang_collaborator_user_id_fkey";
ALTER TABLE "public"."mandeuldang_approval_request" RENAME CONSTRAINT "polygon_approval_request_problem_id_fkey" TO "mandeuldang_approval_request_problem_id_fkey";
ALTER TABLE "public"."mandeuldang_approval_request" RENAME CONSTRAINT "polygon_approval_request_requester_id_fkey" TO "mandeuldang_approval_request_requester_id_fkey";
ALTER TABLE "public"."mandeuldang_approval_request" RENAME CONSTRAINT "polygon_approval_request_reviewer_id_fkey" TO "mandeuldang_approval_request_reviewer_id_fkey";

-- RenameIndex (Unique constraints / indexes)
ALTER INDEX "public"."polygon_test_file_problem_id_base_name_idx" RENAME TO "mandeuldang_test_file_problem_id_base_name_idx";
ALTER INDEX "public"."polygon_solution_problem_id_key" RENAME TO "mandeuldang_solution_problem_id_key";
ALTER INDEX "public"."polygon_tool_problem_id_tool_type_key" RENAME TO "mandeuldang_tool_problem_id_tool_type_key";
ALTER INDEX "public"."polygon_collaborator_problem_id_user_id_key" RENAME TO "mandeuldang_collaborator_problem_id_user_id_key";

-- CreateTable (신규 테이블 — 기존 대응 테이블 없음)
CREATE TABLE "public"."mandeuldang_run_request" (
    "id" SERIAL NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "requester_id" INTEGER NOT NULL,
    "tool_type" "public"."ToolType" NOT NULL,
    "status" "public"."MandeuldangRunStatus" NOT NULL DEFAULT 'Pending',
    "result_code" INTEGER,
    "request_args" JSONB,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "mandeuldang_run_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mandeuldang_run_request_problem_id_tool_type_idx" ON "public"."mandeuldang_run_request"("problem_id", "tool_type");

-- AddForeignKey
ALTER TABLE "public"."mandeuldang_run_request" ADD CONSTRAINT "mandeuldang_run_request_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."mandeuldang_problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."mandeuldang_run_request" ADD CONSTRAINT "mandeuldang_run_request_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
