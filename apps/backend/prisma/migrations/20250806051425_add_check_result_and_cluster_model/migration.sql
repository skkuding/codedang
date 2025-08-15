/*
  Warnings:

  - You are about to drop the `plagiarism_check` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "plagiarism_check" DROP CONSTRAINT "plagiarism_check_assignment_id_fkey";

-- DropForeignKey
ALTER TABLE "plagiarism_check" DROP CONSTRAINT "plagiarism_check_contest_id_fkey";

-- DropForeignKey
ALTER TABLE "plagiarism_check" DROP CONSTRAINT "plagiarism_check_problem_id_fkey";

-- DropForeignKey
ALTER TABLE "plagiarism_check" DROP CONSTRAINT "plagiarism_check_user_id_fkey";

-- DropForeignKey
ALTER TABLE "plagiarism_check" DROP CONSTRAINT "plagiarism_check_workbook_id_fkey";

-- DropTable
DROP TABLE "plagiarism_check";

-- CreateTable
CREATE TABLE "check_request" (
    "id" SERIAL NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "language" "Language" NOT NULL,
    "check_previous_submission" BOOLEAN NOT NULL,
    "enable_merging" BOOLEAN NOT NULL,
    "min_tokens" INTEGER NOT NULL,
    "use_jplag_clustering" BOOLEAN NOT NULL,
    "assignment_id" INTEGER,
    "contest_id" INTEGER,
    "workbook_id" INTEGER,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" "CheckResultStatus" NOT NULL,

    CONSTRAINT "check_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_result" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "first_user_id" INTEGER,
    "second_user_id" INTEGER,
    "average_similarity" DOUBLE PRECISION,
    "max_similarity" DOUBLE PRECISION,
    "max_length" INTEGER,
    "longest_match" INTEGER,
    "matches" JSONB[],
    "first_similarity" DOUBLE PRECISION,
    "second_similarity" DOUBLE PRECISION,
    "cluster_id" INTEGER,

    CONSTRAINT "check_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlagiarismCluster" (
    "id" SERIAL NOT NULL,
    "average_similarity" DOUBLE PRECISION,
    "second_user_id" DOUBLE PRECISION,

    CONSTRAINT "PlagiarismCluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCluster" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "cluster_id" INTEGER NOT NULL,

    CONSTRAINT "UserCluster_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "check_request" ADD CONSTRAINT "check_request_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_request" ADD CONSTRAINT "check_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_request" ADD CONSTRAINT "check_request_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_request" ADD CONSTRAINT "check_request_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_request" ADD CONSTRAINT "check_request_workbook_id_fkey" FOREIGN KEY ("workbook_id") REFERENCES "workbook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_result" ADD CONSTRAINT "check_result_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "check_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_result" ADD CONSTRAINT "check_result_first_user_id_fkey" FOREIGN KEY ("first_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_result" ADD CONSTRAINT "check_result_second_user_id_fkey" FOREIGN KEY ("second_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_result" ADD CONSTRAINT "check_result_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "PlagiarismCluster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCluster" ADD CONSTRAINT "UserCluster_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCluster" ADD CONSTRAINT "UserCluster_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "PlagiarismCluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;
