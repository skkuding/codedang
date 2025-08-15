/*
  Warnings:

  - You are about to drop the `user_Cluster` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."check_result" DROP CONSTRAINT "check_result_first_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."check_result" DROP CONSTRAINT "check_result_second_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_Cluster" DROP CONSTRAINT "user_Cluster_cluster_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_Cluster" DROP CONSTRAINT "user_Cluster_user_id_fkey";

-- DropTable
DROP TABLE "public"."user_Cluster";

-- CreateTable
CREATE TABLE "public"."submission_Cluster" (
    "id" SERIAL NOT NULL,
    "submission_id" INTEGER NOT NULL,
    "cluster_id" INTEGER NOT NULL,

    CONSTRAINT "submission_Cluster_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."check_result" ADD CONSTRAINT "check_result_first_user_id_fkey" FOREIGN KEY ("first_user_id") REFERENCES "public"."submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."check_result" ADD CONSTRAINT "check_result_second_user_id_fkey" FOREIGN KEY ("second_user_id") REFERENCES "public"."submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submission_Cluster" ADD CONSTRAINT "submission_Cluster_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submission_Cluster" ADD CONSTRAINT "submission_Cluster_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "public"."plagiarism_cluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;
