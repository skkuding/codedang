-- CreateEnum
CREATE TYPE "public"."PolygonProblemStatus" AS ENUM ('Draft', 'Ready', 'PendingApproval', 'Rejected', 'Published');

-- CreateEnum
CREATE TYPE "public"."TestFileType" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "public"."CollaboratorRole" AS ENUM ('Editor', 'Viewer');

-- CreateEnum
CREATE TYPE "public"."CollaboratorStatus" AS ENUM ('Pending', 'Active');

-- CreateEnum
CREATE TYPE "public"."PolygonApprovalStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "public"."ToolType" AS ENUM ('Generator', 'Validator', 'Checker');

-- CreateTable
CREATE TABLE "public"."polygon_problem" (
    "id" SERIAL NOT NULL,
    "created_by_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "input_description" TEXT NOT NULL,
    "output_description" TEXT NOT NULL,
    "time_limit" INTEGER NOT NULL,
    "memory_limit" INTEGER NOT NULL,
    "languages" "public"."Language"[],
    "difficulty" "public"."Level" NOT NULL,
    "status" "public"."PolygonProblemStatus" NOT NULL DEFAULT 'Draft',
    "last_run_pass" BOOLEAN NOT NULL DEFAULT false,
    "solution" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "polygon_problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."polygon_sample" (
    "id" SERIAL NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "input_text" TEXT NOT NULL,
    "output_text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polygon_sample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."polygon_test_file" (
    "id" SERIAL NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "file_name" TEXT NOT NULL,
    "base_name" TEXT NOT NULL,
    "file_type" "public"."TestFileType" NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polygon_test_file_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."polygon_solution" (
    "id" SERIAL NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "language" "public"."Language" NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "polygon_solution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."polygon_tool" (
    "id" SERIAL NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "tool_type" "public"."ToolType" NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "polygon_tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."polygon_collaborator" (
    "id" SERIAL NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" "public"."CollaboratorRole" NOT NULL,
    "status" "public"."CollaboratorStatus" NOT NULL DEFAULT 'Pending',
    "invited_by" INTEGER,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polygon_collaborator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."polygon_approval_request" (
    "id" SERIAL NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "requester_id" INTEGER NOT NULL,
    "status" "public"."PolygonApprovalStatus" NOT NULL DEFAULT 'Pending',
    "message" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewer_id" INTEGER,
    "reviewed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,

    CONSTRAINT "polygon_approval_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "polygon_test_file_problem_id_base_name_idx" ON "public"."polygon_test_file"("problem_id", "base_name");

-- CreateIndex
CREATE UNIQUE INDEX "polygon_solution_problem_id_key" ON "public"."polygon_solution"("problem_id");

-- CreateIndex
CREATE UNIQUE INDEX "polygon_tool_problem_id_tool_type_key" ON "public"."polygon_tool"("problem_id", "tool_type");

-- CreateIndex
CREATE UNIQUE INDEX "polygon_collaborator_problem_id_user_id_key" ON "public"."polygon_collaborator"("problem_id", "user_id");

-- AddForeignKey
ALTER TABLE "public"."polygon_problem" ADD CONSTRAINT "polygon_problem_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."polygon_sample" ADD CONSTRAINT "polygon_sample_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."polygon_problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."polygon_test_file" ADD CONSTRAINT "polygon_test_file_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."polygon_problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."polygon_solution" ADD CONSTRAINT "polygon_solution_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."polygon_problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."polygon_tool" ADD CONSTRAINT "polygon_tool_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."polygon_problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."polygon_collaborator" ADD CONSTRAINT "polygon_collaborator_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."polygon_problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."polygon_collaborator" ADD CONSTRAINT "polygon_collaborator_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."polygon_collaborator" ADD CONSTRAINT "polygon_collaborator_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."polygon_approval_request" ADD CONSTRAINT "polygon_approval_request_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."polygon_problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."polygon_approval_request" ADD CONSTRAINT "polygon_approval_request_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."polygon_approval_request" ADD CONSTRAINT "polygon_approval_request_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
