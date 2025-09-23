-- CreateEnum
CREATE TYPE "CheckResultStatus" AS ENUM ('Pending', 'Completed', 'JplagError', 'TokenError', 'ServerError');

-- CreateTable
CREATE TABLE "check_request" (
    "id" SERIAL NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "language" "Language" NOT NULL,
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
    "average_similarity" DOUBLE PRECISION NOT NULL,
    "max_similarity" DOUBLE PRECISION NOT NULL,
    "max_length" INTEGER  NOT NULL,
    "longest_match" INTEGER NOT NULL,
    "matches" JSONB[],
    "first_similarity" DOUBLE PRECISION NOT NULL,
    "second_similarity" DOUBLE PRECISION  NOT NULL,
    "cluster_id" INTEGER,

    CONSTRAINT "check_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plagiarism_cluster" (
    "id" SERIAL NOT NULL,
    "average_similarity" DOUBLE PRECISION NOT NULL,
    "second_user_id" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "plagiarism_cluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."submission_Cluster" (
    "id" SERIAL NOT NULL,
    "submission_id" INTEGER NOT NULL,
    "cluster_id" INTEGER NOT NULL,

    CONSTRAINT "submission_Cluster_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "submission_Cluster" DROP CONSTRAINT "submission_Cluster_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "submission_Cluster_pkey" PRIMARY KEY ("submission_id", "cluster_id");

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
ALTER TABLE "public"."check_result" ADD CONSTRAINT "check_result_first_user_id_fkey" FOREIGN KEY ("first_user_id") REFERENCES "public"."submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."check_result" ADD CONSTRAINT "check_result_second_user_id_fkey" FOREIGN KEY ("second_user_id") REFERENCES "public"."submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_result" ADD CONSTRAINT "check_result_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "plagiarism_cluster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submission_Cluster" ADD CONSTRAINT "submission_Cluster_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submission_Cluster" ADD CONSTRAINT "submission_Cluster_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "public"."plagiarism_cluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;
